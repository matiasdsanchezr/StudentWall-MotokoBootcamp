import Type "Types";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Option "mo:base/Option"

actor class StudentWall() {
  type Message = Type.Message;
  type Content = Type.Content;
  type Survey = Type.Survey;
  type Answer = Type.Answer;

  var messageId : Nat = 0;
  func _hashNat(n : Nat) : Hash.Hash = return Text.hash(Nat.toText(n));
  let wall = HashMap.HashMap<Nat, Message>(0, Nat.equal, _hashNat);

  // Add a new message to the wall
  public shared ({ caller }) func writeMessage(c : Content) : async Nat {
    let newMessageId = messageId;
    let newMessage : Message = {
      content = c;
      vote = 0;
      creator = caller;
    };
    wall.put(newMessageId, newMessage);
    messageId += 1;
    return newMessageId;
  };

  // Get a specific message by ID
  public shared query func getMessage(messageId : Nat) : async Result.Result<Message, Text> {
    return switch (wall.get(messageId)) {
      case (?message) #ok(message);
      case (_) #err("Invalid message id");
    };
  };

  // Update the content for a specific message by ID
  public shared ({ caller }) func updateMessage(messageId : Nat, c : Content) : async Result.Result<(), Text> {
    let message = switch (wall.get(messageId)) {
      case (?message) {
        if (message.creator != caller) {
          return #err("Invalid message creator");
        } else message;
      };
      case (_) return #err("Invalid message id");
    };
    let newMessage : Message = {
      content = c;
      vote = message.vote;
      creator = message.creator;
    };
    wall.put(messageId, newMessage);
    return #ok();
  };

  // Delete a specific message by ID
  public shared ({ caller }) func deleteMessage(messageId : Nat) : async Result.Result<(), Text> {
    return switch (wall.remove(messageId)) {
      case (?message) #ok();
      case (_) #err("Invalid message id");
    };
  };

  // Voting
  public func upVote(messageId : Nat) : async Result.Result<(), Text> {
    let message = switch (wall.get(messageId)) {
      case (?message) message;
      case (_) return #err("Invalid message id");
    };
    let newMessage : Message = {
      content = message.content;
      vote = message.vote + 1;
      creator = message.creator;
    };
    wall.put(messageId, newMessage);
    return #ok();
  };

  public func downVote(messageId : Nat) : async Result.Result<(), Text> {
    let message = switch (wall.get(messageId)) {
      case (?message) message;
      case (_) return #err("Invalid message id");
    };
    let newMessage : Message = {
      content = message.content;
      vote = message.vote - 1;
      creator = message.creator;
    };
    wall.put(messageId, newMessage);
    return #ok();
  };

  // Get all messages
  public func getAllMessages() : async [Message] {
    return Iter.toArray<Message>(wall.vals());
  };

  private func messageCompare(x : Message, y : Message) : {
    #less;
    #equal;
    #greater;
  } {
    if (x.vote > y.vote) { #less } else if (x == y) { #equal } else { #greater };
  };

  // Get all messages ordered by votes
  public func getAllMessagesRanked() : async [Message] {
    let sortedMessages = Iter.sort(wall.vals(), messageCompare);
    return Iter.toArray<Message>(sortedMessages);
  };
};
