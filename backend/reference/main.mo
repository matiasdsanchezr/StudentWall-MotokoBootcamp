import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Interface "ic-management-interface";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Map "mo:map/Map";
import Account "Account";
import TrieMap "mo:base/TrieMap";

actor motokoBootcampBackend {
  //==============================
  //============ Main ============
  //==============================
  let { phash; nhash } = Map;

  public type User = {
    name : Text;
  };

  stable let userStore = Map.new<Principal, User>(phash);

  private func addUser(principalId : Principal, newUser : User) : () {
    Map.set(userStore, phash, principalId, newUser);
  };

  private func getUser(principalId : Principal) : User {
    switch (Map.get(userStore, phash, principalId)) {
      case (?user) user;
      case null {
        let newUser = { name = "Anonymous" };
        addUser(principalId, newUser);
        newUser;
      };
    };
  };

  public shared (msg) func whoami() : async Principal {
    msg.caller;
  };

  //============================================
  //============ Day 1 - Calculator ============
  //============================================
  let calculatorStore = Map.new<Principal, Float>(phash);

  func _getCalculatorCounter(principalId : Principal) : Float {
    switch (Map.get(calculatorStore, phash, principalId)) {
      case (?counter) counter;
      case null 0;
    };
  };

  func _setCalculatorCounter(principalId : Principal, counter : Float) : () {
    Map.set(calculatorStore, phash, principalId, counter);
  };

  public shared ({ caller }) func calculatorAdd(x : Float) : async Float {
    var counter = _getCalculatorCounter(caller);
    counter += x;
    _setCalculatorCounter(caller, counter);
    counter;
  };

  public shared ({ caller }) func calculatorSub(x : Float) : async Float {
    var counter = _getCalculatorCounter(caller);
    counter -= x;
    _setCalculatorCounter(caller, counter);
    counter;
  };

  public shared ({ caller }) func calculatorMul(x : Float) : async Float {
    var counter = _getCalculatorCounter(caller);
    counter *= x;
    _setCalculatorCounter(caller, counter);
    counter;
  };

  public shared ({ caller }) func calculatorDiv(x : Float) : async ?Float {
    if (x == 0) return null;
    var counter = _getCalculatorCounter(caller);
    counter /= x;
    _setCalculatorCounter(caller, counter);
    ?counter;
  };

  public shared ({ caller }) func calculatorReset() : async () {
    _setCalculatorCounter(caller, 0);
  };

  public shared query ({ caller }) func calculatorSee() : async Float {
    _getCalculatorCounter(caller);
  };

  public shared ({ caller }) func calculatorPower(x : Float) : async Float {
    var counter = _getCalculatorCounter(caller);
    counter := Float.pow(counter, x);
    _setCalculatorCounter(caller, counter);
    counter;
  };

  public shared ({ caller }) func calculatorSqrt() : async Float {
    var counter = _getCalculatorCounter(caller);
    counter := Float.sqrt(counter);
    _setCalculatorCounter(caller, counter);
    counter;
  };

  public shared query ({ caller }) func calculatorFloor() : async Int {
    var counter = _getCalculatorCounter(caller);
    counter := Float.floor(counter);
    Float.toInt(counter);
  };

  //================================================
  //============ Day 2 - Homework Diary ============
  //================================================
  type Time = Time.Time;

  type Homework = {
    title : Text;
    description : Text;
    dueDate : Time;
    completed : Bool;
  };

  let diaryStore = Map.new<Principal, Buffer.Buffer<Homework>>(phash);

  func _getDiary(principalId : Principal) : Buffer.Buffer<Homework> {
    switch (Map.get(diaryStore, phash, principalId)) {
      case (?diary) diary;
      case null Buffer.Buffer<Homework>(10);
    };
  };

  func _setDiary(principalId : Principal, diary : Buffer.Buffer<Homework>) : () {
    Map.set(diaryStore, phash, principalId, diary);
  };

  public shared ({ caller }) func diaryAddHomework(homework : Homework) : async Nat {
    let diary = _getDiary(caller);
    diary.add(homework);
    _setDiary(caller, diary);
    diary.size() - 1;
  };

  public shared query ({ caller }) func diaryGetHomework(id : Nat) : async Result.Result<Homework, Text> {
    let diary = _getDiary(caller);
    if (id >= diary.size()) return #err("Invalid id");
    #ok(diary.get(id));
  };

  public shared ({ caller }) func diaryUpdateHomework(id : Nat, homework : Homework) : async Result.Result<(), Text> {
    let diary = _getDiary(caller);
    if (id >= diary.size()) return #err("Invalid id");
    diary.put(id, homework);
    _setDiary(caller, diary);
    #ok();
  };

  public shared ({ caller }) func diaryMarkAsCompleted(id : Nat) : async Result.Result<(), Text> {
    let diary = _getDiary(caller);
    if (id >= diary.size()) return #err("Invalid id");
    let homework = diary.get(id);
    let modifiedHomework = {
      title = homework.title;
      description = homework.description;
      dueDate = homework.dueDate;
      completed = true;
    };
    diary.put(id, modifiedHomework);
    _setDiary(caller, diary);
    #ok();
  };

  public shared ({ caller }) func diaryDeleteHomework(id : Nat) : async Result.Result<(), Text> {
    let diary = _getDiary(caller);
    if (id >= diary.size()) return #err("Invalid id");
    let homework = diary.remove(id);
    _setDiary(caller, diary);
    #ok();
  };

  public shared query ({ caller }) func diaryGetAllHomework() : async [Homework] {
    let diary = _getDiary(caller);
    Buffer.toArray<Homework>(diary);
  };

  public shared query ({ caller }) func diaryGetPendingHomework() : async [Homework] {
    let diary = _getDiary(caller);
    let pendingHomeworkBuf = Buffer.mapFilter<Homework, Homework>(diary, func(x) = if (x.completed == false) ?x else null);
    Buffer.toArray<Homework>(pendingHomeworkBuf);
  };

  public shared query ({ caller }) func diarySearchHomework(searchTerm : Text) : async [Homework] {
    let diary = _getDiary(caller);
    let homeworkArr = Buffer.toArray<Homework>(diary);
    let pattern = #text searchTerm;

    Array.filter<Homework>(
      homeworkArr,
      func x = Text.contains(x.title, pattern) or Text.contains(x.description, pattern),
    );
  };

  //==============================================
  //============ Day 3 - Student Wall ============
  //==============================================
  public type Content = {
    #Text : Text;
    #Image : Blob;
    #Survey : Survey;
  };

  public type Message = {
    content : Content;
    vote : Int;
    creator : Principal;
  };

  public type Answer = (
    description : Text, // contains description of the answer
    numberOfVotes : Nat // represents the number of votes for this answer
  );

  public type Survey = {
    title : Text; // title describes the survey
    answers : [Answer]; // possible answers for the survey
  };

  var messageId : Nat = 0;
  let wall = Map.new<Nat, Message>(nhash);

  // Add a new message to the wall
  public shared ({ caller }) func wallWriteMessage(c : Content) : async Nat {
    let newMessageId = messageId;
    let newMessage : Message = {
      content = c;
      vote = 0;
      creator = caller;
    };
    Map.set(wall, nhash, newMessageId, newMessage);
    messageId += 1;
    newMessageId;
  };

  // Get a specific message by ID
  public shared query func wallGetMessage(messageId : Nat) : async Result.Result<Message, Text> {
    switch (Map.get(wall, nhash, messageId)) {
      case (?message) #ok(message);
      case (_) #err("Invalid message id");
    };
  };

  // Update the content for a specific message by ID
  public shared ({ caller }) func wallUpdateMessage(messageId : Nat, c : Content) : async Result.Result<(), Text> {
    let message = switch (Map.get(wall, nhash, messageId)) {
      case (?message) {
        if (message.creator == caller) message else return #err("Invalid message creator");
      };
      case (_) return #err("Invalid message id");
    };
    let newMessage : Message = {
      content = c;
      vote = message.vote;
      creator = message.creator;
    };
    Map.set(wall, nhash, messageId, newMessage);
    #ok();
  };

  // Delete a specific message by ID
  public shared ({ caller }) func wallDeleteMessage(messageId : Nat) : async Result.Result<(), Text> {
    switch (Map.remove(wall, nhash, messageId)) {
      case (?message) #ok();
      case (_) #err("Invalid message id");
    };
  };

  // Voting
  public func wallUpVote(messageId : Nat) : async Result.Result<(), Text> {
    let message = switch (Map.get(wall, nhash, messageId)) {
      case (?message) message;
      case null return #err("Invalid message id");
    };
    let newMessage : Message = {
      content = message.content;
      vote = message.vote + 1;
      creator = message.creator;
    };
    Map.set(wall, nhash, messageId, newMessage);
    #ok();
  };

  public func wallDownVote(messageId : Nat) : async Result.Result<(), Text> {
    let message = switch (Map.get(wall, nhash, messageId)) {
      case (?message) message;
      case null return #err("Invalid message id");
    };
    let newMessage : Message = {
      content = message.content;
      vote = message.vote - 1;
      creator = message.creator;
    };
    Map.set(wall, nhash, messageId, newMessage);
    #ok();
  };

  // Get all messages
  public func wallGetAllMessages() : async [Message] {
    Iter.toArray<Message>(Map.vals(wall));
  };

  // Message sorting func
  private func messageCompare(x : Message, y : Message) : {
    #less;
    #equal;
    #greater;
  } {
    if (x.vote > y.vote) { #less } else if (x == y) { #equal } else { #greater };
  };

  // Get all messages ordered by votes
  public func wallGetAllMessagesRanked() : async [Message] {
    let sortedMessages = Iter.sort(Map.vals(wall), messageCompare);
    Iter.toArray<Message>(sortedMessages);
  };

  //==========================================
  //============ Day 4 - Motocoin ============
  //==========================================
  public type Account = Account.Account;

  let ledger = TrieMap.TrieMap<Account, Nat>(Account.accountsEqual, Account.accountsHash);

  // Returns the name of the token
  public query func motocoinName() : async Text {
    "MotoCoin";
  };

  // Returns the symbol of the token
  public query func motocoinSymbol() : async Text {
    "MOC";
  };

  // Returns the the total number of tokens on all accounts
  public func motocoinTotalSupply() : async Nat {
    var totalBalance = 0;
    for (balance in ledger.vals()) {
      totalBalance += balance;
    };
    totalBalance;
  };

  // Returns the default transfer fee
  public query func motocoinBalanceOf(account : Account) : async (Nat) {
    switch (ledger.get(account)) {
      case (null) return 0;
      case (?balance) return balance;
    };
  };

  // Transfer tokens to another account
  public shared ({ caller }) func motocoinTransfer(
    from : Account,
    to : Account,
    amount : Nat,
  ) : async Result.Result<(), Text> {
    if (amount == 0) return #err("Amount to transfer must be greater than 0");
    let senderBalance = switch (ledger.get(from)) {
      case null 0;
      case (?balance) balance;
    };
    let recipientBalance = switch (ledger.get(to)) {
      case null 0;
      case (?balance) balance;
    };
    if (senderBalance < amount) return #err("Not enough balance");
    ledger.put(from, senderBalance - amount);
    ledger.put(to, recipientBalance + amount);
    #ok;
  };

  let bootcampLocalActor = actor ("bw4dl-smaaa-aaaaa-qaacq-cai") : actor {
    getAllStudentsPrincipal : shared () -> async [Principal];
  };

  // Airdrop 1000 MotoCoin to any student that is part of the Bootcamp.
  public func motocoinAirdrop() : async Result.Result<(), Text> {
    let students : [Principal] = await bootcampLocalActor.getAllStudentsPrincipal();
    for (principal in Iter.fromArray(students)) {
      let account = { owner = principal; subaccount = null };
      switch (ledger.get(account)) {
        case (null) ledger.put(account, 1000);
        case (?balance) ledger.put(account, balance + 1000);
      };
    };
    #ok();
  };

  //==============================================
  //============ Day 5 - The Verifier ============
  //==============================================

  // ============ Part 1 - Storing Students ============
  public type StudentProfile = {
    name : Text;
    team : Text;
    graduate : Bool;
  };

  let studentProfileStore = Map.new<Principal, StudentProfile>(phash);

  public shared ({ caller }) func verifierAddMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    switch (Map.get(studentProfileStore, phash, caller)) {
      case (?student) return #err("Already registered student");
      case null {
        Map.set(studentProfileStore, phash, caller, profile);
        #ok();
      };
    };
  };

  public query func verifierSeeAProfile(p : Principal) : async Result.Result<StudentProfile, Text> {
    switch (Map.get(studentProfileStore, phash, p)) {
      case (?student) return #ok(student);
      case null return #err("Not registered student");
    };
  };

  public shared query ({ caller }) func verifierSeeMyProfile() : async Result.Result<StudentProfile, Text> {
    switch (Map.get(studentProfileStore, phash, caller)) {
      case null return #err("Not registered student");
      case (?student) return #ok(student);
    };
  };

  public shared ({ caller }) func verifierUpdateMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    switch (Map.get(studentProfileStore, phash, caller)) {
      case null #err("Not registered student");
      case (?student) {
        Map.set(studentProfileStore, phash, caller, profile);
        #ok();
      };
    };
  };

  public shared ({ caller }) func verifierDeleteMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    switch (Map.remove(studentProfileStore, phash, caller)) {
      case null #err("Not registered student");
      case (?student) #ok();
    };
  };

  // ============ Part 2 - Tests declarations ============
  public type TestResult = Result.Result<(), TestError>;
  public type TestError = {
    #UnexpectedValue : Text;
    #UnexpectedError : Text;
  };

  func test(canisterId : Principal) : async TestResult {
    try {
      let calculatorCanister = actor (Principal.toText(canisterId)) : actor {
        add : shared (n : Int) -> async Int;
        sub : shared (n : Nat) -> async Int;
        reset : shared () -> async Int;
      };

      var counter = await calculatorCanister.reset();
      if (counter != 0) return #err(#UnexpectedValue("Unexpected value in reset function"));

      counter := await calculatorCanister.add(10);
      if (counter != 10) return #err(#UnexpectedValue("Unexpected value in add function"));

      counter := await calculatorCanister.sub(5);
      if (counter != 5) return #err(#UnexpectedValue("Unexpected value in sub function"));

    } catch (e) {
      return #err(#UnexpectedError("Unexpected error - " # Error.message(e)));
    };

    #ok();
  };

  // ============ Part 3 - Verifying controller ============
  let IC = "aaaaa-aa";
  let ic = actor (IC) : Interface.Self;

  func parseControllersFromCanisterStatusErrorIfCallerNotController(errorMessage : Text) : [Principal] {
    let lines = Iter.toArray(Text.split(errorMessage, #text("\n")));
    let words = Iter.toArray(Text.split(lines[1], #text(" ")));
    var i = 2;
    let controllers = Buffer.Buffer<Principal>(0);
    while (i < words.size()) {
      controllers.add(Principal.fromText(words[i]));
      i += 1;
    };
    Buffer.toArray<Principal>(controllers);
  };

  func _verifyOwnership(canisterId : Principal, principalId : Principal) : async Bool {
    var controllers : [Principal] = [];
    try {
      let canister_id = canisterId;
      let canisterStatus = await ic.canister_status({ canister_id });
      controllers := canisterStatus.settings.controllers;
    } catch (e : Error) {
      controllers := parseControllersFromCanisterStatusErrorIfCallerNotController(Error.message(e));
    };
    switch (Array.find<Principal>(controllers, func x = x == principalId)) {
      case null return false;
      case (_) return true;
    };
  };

  // ============ Part 4 - Graduation  ============
  public shared ({ caller }) func verifierVerifyWork(canisterId : Principal, principalId : Principal) : async Result.Result<(), Text> {
    let isController = await _verifyOwnership(canisterId, principalId);
    if (not isController) return #err("Student is not a controller of the canister");

    let getStudentProfile = await verifierSeeAProfile(principalId);
    let studentProfile = switch (getStudentProfile) {
      case (#err(message)) return #err(message);
      case (#ok(profile)) profile;
    };

    let testPassed = switch (await test(canisterId)) {
      case (#err(testError)) {
        switch (testError) {
          case (#UnexpectedValue(message)) {
            return #err(message);
          };
          case (#UnexpectedError(message)) {
            return #err(message);
          };
        };
      };
      case (#ok) {
        true;
      };
    };

    let studentProfileNew = {
      name = studentProfile.name;
      team = studentProfile.team;
      graduate = true;
    };

    Map.set(studentProfileStore, phash, principalId, studentProfileNew);
    #ok();
  };

};
