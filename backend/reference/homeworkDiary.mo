import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Text "mo:base/Text";

actor {
  type Time = Time.Time;

  type Homework = {
    title : Text;
    description : Text;
    dueDate : Time;
    completed : Bool;
  };

  let homeworkDiary = Buffer.Buffer<Homework>(1);

  public shared func addHomework(homework : Homework) : async Nat {
    homeworkDiary.add(homework);
    homeworkDiary.size() - 1;
  };

  public shared func getHomework(id : Nat) : async Result.Result<Homework, Text> {
    if (id >= homeworkDiary.size()) return #err("Invalid id");
    #ok(homeworkDiary.get(id));
  };

  public shared func updateHomework(id : Nat, homework : Homework) : async Result.Result<(), Text> {
    if (id >= homeworkDiary.size()) return #err("Invalid id");
    homeworkDiary.put(id, homework);
    #ok();
  };

  public shared func markAsCompleted(id : Nat) : async Result.Result<(), Text> {
    if (id >= homeworkDiary.size()) return #err("Invalid id");
    let homework = homeworkDiary.get(id);
    let modifiedHomework = {
      title = homework.title;
      description = homework.description;
      dueDate = homework.dueDate;
      completed = true;
    };
    homeworkDiary.put(id, modifiedHomework);
    #ok();
  };

  public shared func deleteHomework(id : Nat) : async Result.Result<(), Text> {
    if (id >= homeworkDiary.size()) return #err("Invalid id");
    let homework = homeworkDiary.remove(id);
    #ok();
  };

  public shared query func getAllHomework() : async [Homework] {
    Buffer.toArray<Homework>(homeworkDiary);
  };

  public shared query func getPendingHomework() : async [Homework] {
    let pendingHomeworkBuf = Buffer.mapFilter<Homework, Homework>(homeworkDiary, func(x) = if (x.completed == false) ?x else null);
    Buffer.toArray<Homework>(pendingHomeworkBuf);
  };

  public shared query func searchHomework(searchTerm : Text) : async [Homework] {
    let homeworkArr = Buffer.toArray<Homework>(homeworkDiary);
    let pattern = #text searchTerm;

    Array.filter<Homework>(
      homeworkArr,
      func x = Text.contains(x.title, pattern) or Text.contains(x.description, pattern),
    );
  };

};
