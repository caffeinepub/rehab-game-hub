import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type GameId = Text;
  type QuestionId = Text;
  type Option = Text;

  type OldMatchWordToImageQuestion = {
    id : QuestionId;
    image : Storage.ExternalBlob;
    options : [Option];
    correctOption : Option;
  };

  type OldChooseCorrectImageQuestion = {
    id : Text;
    word : Text;
    images : [Storage.ExternalBlob];
    correctImageIndex : Nat;
  };

  type OldActor = {
    persistentGames : Map.Map<GameId, {
                              id : GameId;
                              name : Text;
                              description : Text;
                              icon : Text;
                              badges : [Text];
                              primaryColor : Text;
                              secondaryColor : Text;
                              tags : [Text];
                            }>;
    persistentQuestions : Map.Map<GameId, List.List<OldMatchWordToImageQuestion>>;
    persistentChooseCorrectImageQuestions : Map.Map<GameId, List.List<OldChooseCorrectImageQuestion>>;
    _nextQuestionId : Nat;
  };

  public func run(old : OldActor) : {} {
    {};
  };
};
