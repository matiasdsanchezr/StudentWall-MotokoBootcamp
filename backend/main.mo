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

actor {
  let { phash; nhash } = Map;
  type Time = Time.Time;

  public type StudentProfile = {
    name : Text;
    email : Text;
    team : ?Text;
    graduate : Bool;
  };

  public type Homework = {
    title : Text;
    description : Text;
    dueDate : Time;
    completed : Bool;
  };

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

  // ============================================
  // ============ Student Profile ===============
  // ============================================

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
  // ============ Messages ==============================
  // ====================================================
  public type Vote = {
    #Upvote;
    #Downvote;
  };

  public type VoteStore = Map.Map<Nat, Vote>;

  stable var messageId : Nat = 0;
  stable let wall = Map.new<Nat, Message>(nhash);
  stable let studentVoteStore = Map.new<Principal, VoteStore>(phash);

  // Add a new message to the wall
  public shared ({ caller }) func writeMessage(c : Content) : async Result.Result<Nat, Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");
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

  // Get a specific message by ID
  public shared query func getMessage(messageId : Nat) : async Result.Result<Message, Text> {
    switch (Map.get(wall, nhash, messageId)) {
      case (?message) #ok(message);
      case (_) #err("Invalid message id");
    };
  };

  // Update the content for a specific message by ID
  public shared ({ caller }) func updateMessage(messageId : Nat, c : Content) : async Result.Result<(), Text> {
    if (Principal.isAnonymous(caller)) return #err("Anonymous caller");

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

};
