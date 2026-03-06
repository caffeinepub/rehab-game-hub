import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import List "mo:core/List";
import Storage "blob-storage/Storage";

module {
  type Game = {
    id : Text;
    name : Text;
    description : Text;
    icon : Text;
    badges : [Text];
    primaryColor : Text;
    secondaryColor : Text;
    tags : [Text];
  };

  type MatchWordToImageQuestion = {
    id : Text;
    image : Storage.ExternalBlob;
    options : [Text];
    correctOption : Text;
  };

  type ChooseCorrectImageQuestion = {
    id : Text;
    word : Text;
    images : [Storage.ExternalBlob];
    correctImageIndex : Nat;
  };

  type OldActor = {
    persistentGames : Map.Map<Text, Game>;
    persistentQuestions : Map.Map<Text, List.List<MatchWordToImageQuestion>>;
    persistentChooseCorrectImageQuestions : Map.Map<Text, List.List<ChooseCorrectImageQuestion>>;
    _nextQuestionId : Nat;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
