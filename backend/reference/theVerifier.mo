import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
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

actor {
  // ===============================================
  // ======== Part 1 - Storing Students ============
  // ===============================================
  public type StudentProfile = {
    name : Text;
    team : Text;
    graduate : Bool;
  };

  stable var studentProfileStoreArr : [(Principal, StudentProfile)] = [];
  let iter = studentProfileStoreArr.vals();
  let studentProfileStore = HashMap.fromIter<Principal, StudentProfile>(iter, studentProfileStoreArr.size(), Principal.equal, Principal.hash);

  public shared ({ caller }) func addMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    switch (studentProfileStore.get(caller)) {
      case (?student) return #err("Already registered student");
      case null {
        studentProfileStore.put(caller, profile);
        #ok();
      };
    };
  };

  public func seeAProfile(p : Principal) : async Result.Result<StudentProfile, Text> {
    switch (studentProfileStore.get(p)) {
      case null return #err("Not registered student");
      case (?student) return #ok(student);
    };
  };

  public shared ({ caller }) func seeMyProfile() : async Result.Result<StudentProfile, Text> {
    switch (studentProfileStore.get(caller)) {
      case null return #err("Not registered student");
      case (?student) return #ok(student);
    };
  };

  public shared ({ caller }) func updateMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    switch (studentProfileStore.get(caller)) {
      case null #err("Not registered user");
      case (?student) {
        studentProfileStore.put(caller, profile);
        #ok();
      };
    };
  };

  public shared ({ caller }) func deleteMyProfile(profile : StudentProfile) : async Result.Result<(), Text> {
    switch (studentProfileStore.remove(caller)) {
      case null #err("Not registered user");
      case (?student) #ok();
    };
  };

  system func preupgrade() {
    studentProfileStoreArr := Iter.toArray(studentProfileStore.entries());
  };

  // =======================================================
  // ============ Part 2 - Tests declarations ==============
  // =======================================================
  public type TestResult = Result.Result<(), TestError>;
  public type TestError = {
    #UnexpectedValue : Text;
    #UnexpectedError : Text;
  };

  public func test(canisterId : Principal) : async TestResult {
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

    return #ok();
  };

  // ==========================================================
  // ============ Part 3 - Verifying controller  ==============
  // ==========================================================
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

  public shared func verifyOwnership(canisterId : Principal, principalId : Principal) : async Bool {
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

  // ================================================
  // ============ Part 4 - Graduation  ==============
  // ================================================

  public shared ({ caller }) func verifyWork(canisterId : Principal, principalId : Principal) : async Result.Result<(), Text> {
    let isController = await verifyOwnership(canisterId, principalId);
    if (not isController) return #err("Student is not a controller of the canister");

    let getStudentProfile = await seeAProfile(principalId);
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

    studentProfileStore.put(principalId, studentProfileNew);

    return #ok();
  };
};
