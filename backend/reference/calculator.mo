import Float "mo:base/Float";

actor class Calculator() {
  var counter : Float = 0;

  public shared func add(x : Float) : async Float {
    counter += x;
    return counter;
  };

  public shared func sub(x : Float) : async Float {
    counter -= x;
    return counter;
  };

  public shared func mul(x : Float) : async Float {
    counter *= x;
    return counter;
  };

  public shared func div(x : Float) : async ?Float {
    if (x == 0) return null;
    counter := counter / x;
    return ?counter;
  };

  public shared func reset() : async () {
    counter := 0;
  };

  public shared func see() : async Float {
    return counter;
  };

  public shared func power(x : Float) : async Float {
    counter := Float.pow(counter, x);
    return counter;
  };

  public shared func sqrt() : async Float {
    counter := Float.sqrt(counter);
    return counter;
  };

  public shared func floor() : async Int {
    counter := Float.floor(counter);
    return Float.toInt(counter);
  };

};
