import TrieMap "mo:base/TrieMap";
import Trie "mo:base/Trie";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

import Account "Account";
// NOTE: only use for local dev,
// when deploying to IC, import from "rww3b-zqaaa-aaaam-abioa-cai"

actor class MotoCoin() {
  public type Account = Account.Account;

  let ledger = TrieMap.TrieMap<Account, Nat>(Account.accountsEqual, Account.accountsHash);

  // Returns the name of the token
  public query func name() : async Text {
    return "MotoCoin";
  };

  // Returns the symbol of the token
  public query func symbol() : async Text {
    return "MOC";
  };

  // Returns the the total number of tokens on all accounts
  public func totalSupply() : async Nat {
    var totalBalance = 0;
    for (balance in ledger.vals()) {
      totalBalance += balance;
    };
    totalBalance;
  };

  // Returns the default transfer fee
  public query func balanceOf(account : Account) : async (Nat) {
    switch (ledger.get(account)) {
      case (null) return 0;
      case (?balance) return balance;
    };
  };

  // Transfer tokens to another account
  public shared ({ caller }) func transfer(
    from : Account,
    to : Account,
    amount : Nat,
  ) : async Result.Result<(), Text> {
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
    return #ok;
  };

  let bootcampLocalActor = actor ("bw4dl-smaaa-aaaaa-qaacq-cai") : actor {
    getAllStudentsPrincipal : shared () -> async [Principal];
  };

  // Airdrop 1000 MotoCoin to any student that is part of the Bootcamp.
  public func airdrop() : async Result.Result<(), Text> {
    let students : [Principal] = await bootcampLocalActor.getAllStudentsPrincipal();
    for (principal in Iter.fromArray(students)) {
      let account = { owner = principal; subaccount = null };
      switch (ledger.get(account)) {
        case (null) ledger.put(account, 1000);
        case (?balance) ledger.put(account, balance + 1000);
      };
    };
    return #ok();
  };
};
