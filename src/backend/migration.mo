import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  public type GameId = Text;

  public type Game = {
    id : GameId;
    name : Text;
    description : Text;
    icon : Text;
    badges : [Text];
    primaryColor : Text;
    secondaryColor : Text;
    tags : [Text];
  };

  public type Actor = {
    persistentGames : Map.Map<GameId, Game>;
    _nextQuestionId : Nat;
  };

  public func run(old : Actor) : Actor {
    let games = [
      {
        id = "vr-find-x";
        name = "VR Find X";
        description = "Find the X in a VR environment.";
        icon = "vr-icon";
        badges = ["VR", "New"];
        primaryColor = "#FF0000";
        secondaryColor = "#00FF00";
        tags = ["vr", "find"];
      },
      {
        id = "choose-correct-image";
        name = "Choose Correct Image";
        description = "Pick the correct image based on the prompt.";
        icon = "image-icon";
        badges = ["Puzzle"];
        primaryColor = "#0000FF";
        secondaryColor = "#FFFF00";
        tags = ["puzzle", "image"];
      },
      {
        id = "choose-correct-image-questions";
        name = "Choose Correct Image Questions";
        description = "Answer questions by choosing the correct image.";
        icon = "question-icon";
        badges = [];
        primaryColor = "#FF00FF";
        secondaryColor = "#00FFFF";
        tags = ["questions", "image"];
      },
    ];
    { old with persistentGames = Map.fromIter(games.map(func(game) { (game.id, game) }).values()) };
  };
};
