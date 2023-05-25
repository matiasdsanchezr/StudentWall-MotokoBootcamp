import Map "mo:map/Map";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Vector "mo:vector";
import Int "mo:base/Int";

actor {
  let { phash; nhash; ihash } = Map;
  type Time = Time.Time;

  // ============================================
  // ============ Student Profile ===============
  // ============================================

  public type StudentProfile = {
    name : Text;
    email : Text;
    team : ?Text;
    graduate : Bool;
  };

  stable let studentProfileStore = Map.new<Principal, StudentProfile>(phash);

  type StudentProfileResult = Result.Result<StudentProfile, Text>;

  public shared query func seeAProfile(p : Principal) : async StudentProfileResult {
    switch (Map.get(studentProfileStore, phash, p)) {
      case (?student) return #ok(student);
      case null return #err("Not registered student");
    };
  };

  public shared query ({ caller }) func seeMyProfile() : async StudentProfileResult {
    switch (Map.get(studentProfileStore, phash, caller)) {
      case null return #err("Not registered student");
      case (?student) return #ok(student);
    };
  };

  public shared ({ caller }) func updateMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");
    Map.set(studentProfileStore, phash, caller, profile);
    #ok();
  };

  // ====================================================
  // ==================== Messages ======================
  // ====================================================
  public type Content = {
    #Text : Text;
    #Image : Blob;
    #Survey : Survey;
  };

  public type Answer = (
    description : Text, // contains description of the answer
    numberOfVotes : Nat // represents the number of votes for this answer
  );

  public type Survey = {
    title : Text; // title describes the survey
    answers : [Answer]; // possible answers for the survey
  };

  public type Message = {
    id : Nat;
    content : Content;
    vote : Int;
    creator : Principal;
  };

  public type Vote = {
    #Upvote;
    #Downvote;
  };

  public type VoteStore = Map.Map<Nat, Vote>;

  stable var messageId : Nat = 0;
  stable let wall = Map.new<Nat, Message>(nhash);
  stable let studentVoteStore = Map.new<Principal, VoteStore>(phash);

  // Check content of message
  // TODO: Add image and survey verification
  func _checkContent(c : Content) : Result.Result<(), Text> {
    switch (c) {
      case (#Text(text)) {
        if (Text.size(text) > 5000) return #err("Only 5000 character per message allowed");
      };
      case (_) {};
    };
    #ok;
  };

  // Add a new message to the wall
  public shared ({ caller }) func writeMessage(c : Content) : async Result.Result<Nat, Text> {
    if (Principal.isAnonymous(caller)) return #err("An Anonymous caller is not allowed to publish a message");

    switch (_checkContent(c)) {
      case (#err(msg)) {
        return #err(msg);
      };
      case (_) {};
    };

    let newMessageId = messageId;
    messageId += 1;

    let newMessage : Message = {
      id = newMessageId;
      content = c;
      vote = 0;
      creator = caller;
    };

    Map.set(wall, nhash, newMessageId, newMessage);
    #ok(newMessageId);
  };

  // Update the content for a specific message by ID
  public shared ({ caller }) func updateMessage(messageId : Nat, c : Content) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");

    switch (_checkContent(c)) {
      case (#err(msg)) {
        return #err(msg);
      };
      case (_) {};
    };

    let message = switch (Map.get(wall, nhash, messageId)) {
      case null return #err("Invalid message id");
      case (?message) message;
    };

    if (message.creator != caller) {
      return #err("Invalid message creator");
    };

    let updatedMessage : Message = {
      id = message.id;
      content = c;
      vote = message.vote;
      creator = message.creator;
    };

    Map.set(wall, nhash, messageId, updatedMessage);
    #ok();
  };

  // Get a specific message by ID
  public shared query func getMessage(messageId : Nat) : async Result.Result<Message, Text> {
    switch (Map.get(wall, nhash, messageId)) {
      case (?message) #ok(message);
      case (_) #err("Invalid message id");
    };
  };

  // Delete a specific message by ID
  public shared ({ caller }) func deleteMessage(messageId : Nat) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");
    switch (Map.remove(wall, nhash, messageId)) {
      case (?message) #ok();
      case (_) #err("Invalid message id");
    };
  };

  // Get student's votes, instantiate a new one if not found
  public shared query ({ caller }) func getStudentVotes() : async [(Nat, Vote)] {
    if (Principal.isAnonymous(caller)) return [];
    let voteStore = _getStudentVotes(caller);
    Iter.toArray((Map.entries(voteStore)));
  };

  // Get student's HashMap with votes, instantiate a new one if not found
  func _getStudentVotes(principal : Principal) : VoteStore {
    switch (Map.get(studentVoteStore, phash, principal)) {
      case null {
        let newStore = Map.new<Nat, Vote>(nhash);
        Map.set(studentVoteStore, phash, principal, newStore);
        return newStore;
      };
      case (?voteStore) return voteStore;
    };
  };

  // Vote positive
  public shared ({ caller }) func upVote(messageId : Nat) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");
    let message = switch (Map.get(wall, nhash, messageId)) {
      case (?message) message;
      case null return #err("Invalid message id");
    };

    let voteStore = _getStudentVotes(caller);
    let wasDownvoted = switch (Map.get(voteStore, nhash, messageId)) {
      case (?vote) {
        switch (vote) {
          case (#Upvote) return #err("Already voted");
          case (#Downvote) true;
        };
      };
      case (_) false;
    };
    Map.set(voteStore, nhash, messageId, #Upvote);

    let modifiedMessage : Message = {
      id = message.id;
      content = message.content;
      vote = if (wasDownvoted) message.vote + 2 else message.vote + 1;
      creator = message.creator;
    };

    Map.set(wall, nhash, messageId, modifiedMessage);
    #ok();
  };

  // Vote negative
  public shared ({ caller }) func downVote(messageId : Nat) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");
    let message = switch (Map.get(wall, nhash, messageId)) {
      case (?message) message;
      case null return #err("Invalid message id");
    };

    let voteStore = _getStudentVotes(caller);
    let wasUpvoted = switch (Map.get(voteStore, nhash, messageId)) {
      case (?vote) {
        switch (vote) {
          case (#Upvote) true;
          case (#Downvote) return #err("Already voted");
        };
      };
      case (_) false;
    };
    Map.set(voteStore, nhash, messageId, #Downvote);

    let newMessage : Message = {
      id = message.id;
      content = message.content;
      vote = if (wasUpvoted) message.vote - 2 else message.vote - 1;
      creator = message.creator;
    };

    Map.set(wall, nhash, messageId, newMessage);
    #ok();
  };

  // Get all messages
  public shared query ({ caller }) func getAllMessages() : async [Message] {
    if (Principal.isAnonymous(caller)) return [];
    Iter.toArray<Message>(Map.vals(wall));
  };

  // Message sorting function
  func _compareVote(x : Message, y : Message) : {
    #less;
    #equal;
    #greater;
  } {
    if (x.vote > y.vote) { #less } else if (x.vote == y.vote) { #equal } else {
      #greater;
    };
  };

  // Get all messages ordered by votes.
  public shared query func getAllMessagesRanked() : async [Message] {
    let sortedMessages = Iter.sort(Map.vals(wall), _compareVote);
    Iter.toArray<Message>(sortedMessages);
  };

  // Return messages' pages count. 10 messages per page.
  public shared query func getMessagesPageCount() : async Int {
    let x : Float = Float.fromInt(Map.size(wall)) / 10;
    Float.toInt(Float.ceil(x));
  };

  func _getMessagesPageCount() : Int {
    let x : Float = Float.fromInt(Map.size(wall)) / 10;
    Float.toInt(Float.ceil(x));
  };

  // Get paginated message. Returns 10 messages per page.
  public shared query func getPaginatedMessages(pageNumber : Nat) : async [Message] {
    if (pageNumber == 0) return [];
    let pagesCount = _getMessagesPageCount();
    if (pageNumber > pagesCount) return [];

    let messagesIter = Map.vals(wall);
    var messagesBuf = Buffer.fromIter<Message>(messagesIter);
    Buffer.reverse(messagesBuf);

    let messagesCount = Map.size(wall);
    var length = switch (pageNumber == pagesCount) {
      case true messagesCount - (pageNumber - 1) * 10 : Nat;
      case false 10;
    };
    messagesBuf := Buffer.subBuffer(messagesBuf, (pageNumber - 1) * 10 : Nat, length);

    Buffer.toArray(messagesBuf);
  };

  // Get paginated message ranked by votes. Returns 10 messages per page.
  public shared query func getPaginatedMessagesRanked(pageNumber : Nat) : async [Message] {
    if (pageNumber == 0) return [];
    let pagesCount = _getMessagesPageCount();
    if (pageNumber > pagesCount) return [];

    let messagesIter = Map.vals(wall);
    var messagesBuf = Buffer.fromIter<Message>(messagesIter);
    messagesBuf.sort(_compareVote);

    let messagesCount = Map.size(wall);
    var length = switch (pageNumber == pagesCount) {
      case true messagesCount - (pageNumber - 1) * 10 : Nat;
      case false 10;
    };
    messagesBuf := Buffer.subBuffer(messagesBuf, (pageNumber - 1) * 10 : Nat, length);

    Buffer.toArray<Message>(messagesBuf);
  };

  // ====================================================
  // ================ Homework Diary ====================
  // ====================================================
  type Homework = {
    title : Text;
    description : Text;
    dueDate : Time;
    completed : Bool;
  };

  public type DiaryStore = Map.Map<Int, Homework>;
  stable let studentDiaryStore = Map.new<Principal, DiaryStore>(phash);

  func _getDiary(principalId : Principal) : DiaryStore {
    switch (Map.get(studentDiaryStore, phash, principalId)) {
      case (?diary) diary;
      case null {
        let newDiary = Map.new<Int, Homework>(ihash);
        _setDiary(principalId, newDiary);
        newDiary;
      };
    };
  };

  func _setDiary(principalId : Principal, diary : DiaryStore) : () {
    Map.set(studentDiaryStore, phash, principalId, diary);
  };

  public shared ({ caller }) func addHomework(homework : Homework) : async Int {
    let diary = _getDiary(caller);
    let homeworkId : Int = Time.now();
    Map.set(diary, ihash, homeworkId, homework);
    homeworkId;
  };

  public shared query ({ caller }) func getHomework(id : Nat) : async Result.Result<Homework, Text> {
    let diary = _getDiary(caller);
    switch (Map.get(diary, ihash, id)) {
      case (?homework) #ok(homework);
      case (_) #err("Invalid id");
    };
  };

  public shared ({ caller }) func updateHomework(id : Nat, homework : Homework) : async Result.Result<(), Text> {
    let diary = _getDiary(caller);
    switch (Map.get(diary, ihash, id)) {
      case null #err("Invalid id");
      case (?oldHomework) {
        Map.set(diary, ihash, id, homework);
        #ok;
      };
    };
  };

  public shared ({ caller }) func markAsCompleted(id : Nat) : async Result.Result<(), Text> {
    let diary = _getDiary(caller);
    let homework = switch (Map.get(diary, ihash, id)) {
      case null return #err("Invalid id");
      case (?homework) homework;
    };

    let modifiedHomework = {
      title = homework.title;
      description = homework.description;
      dueDate = homework.dueDate;
      completed = true;
    };

    Map.set(diary, ihash, id, modifiedHomework);
    #ok;
  };

  public shared ({ caller }) func deleteHomework(id : Nat) : async Result.Result<(), Text> {
    let diary = _getDiary(caller);
    switch (Map.remove(diary, ihash, id)) {
      case null return #err("Invalid id");
      case (?homework) #ok;
    };
  };

  public shared query ({ caller }) func getAllHomework() : async [(Int, Homework)] {
    let diary = _getDiary(caller);
    Map.toArray(diary);
  };

  public shared query ({ caller }) func getPendingHomework() : async [(Int, Homework)] {
    let diary = _getDiary(caller);
    let homeworkArr = Map.toArray(diary);
    Array.filter<(Int, Homework)>(homeworkArr, func(x, y) = y.completed == false);
  };

  public shared query ({ caller }) func searchHomework(searchTerm : Text) : async [(Int, Homework)] {
    let diary = _getDiary(caller);
    let homeworkArr = Map.toArray<Int, Homework>(diary);
    let pattern = #text searchTerm;

    Array.filter<(Int, Homework)>(
      homeworkArr,
      func x = Text.contains(x.1.title, pattern) or Text.contains(x.1.description, pattern),
    );
  };

};
