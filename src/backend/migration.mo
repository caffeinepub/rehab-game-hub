import Map "mo:core/Map";
import List "mo:core/List";
import Storage "blob-storage/Storage";

module {
  type GameId = Text;

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

  type QuestionId = Text;
  type Option = Text;

  public type MatchWordToImageQuestion = {
    id : QuestionId;
    image : Storage.ExternalBlob;
    options : [Option];
    correctOption : Option;
  };

  type Actor = {
    persistentGames : Map.Map<Text, Game>;
    persistentQuestions : Map.Map<Text, List.List<MatchWordToImageQuestion>>;
    _nextQuestionId : Nat;
  };

  public func run(old : Actor) : Actor {
    // Add the predefined "Match Word to Image" game if it's missing
    if (not old.persistentGames.containsKey("match-word-to-image")) {
      let predefinedGame : Game = {
        id = "match-word-to-image";
        name = "Match Word to Image";
        description = "A game where you match words to corresponding images.";
        icon = "default-icon-id";
        badges = [];
        primaryColor = "#0072ce";
        secondaryColor = "#005fa3";
        tags = ["word-matching", "image-recognition"];
      };

      old.persistentGames.add("match-word-to-image", predefinedGame);
    };

    old;
  };
};
