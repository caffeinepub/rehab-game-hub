import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    persistentGames : Map.Map<Text, { id : Text; name : Text; description : Text; icon : Text; badges : [Text]; primaryColor : Text; secondaryColor : Text; tags : [Text] }>;
    persistentQuestions : Map.Map<Text, List.List<{ id : Text; image : Storage.ExternalBlob; options : [Text]; correctOption : Text }>>;
    persistentChooseCorrectImageQuestions : Map.Map<Text, List.List<{ id : Text; word : Text; images : [Storage.ExternalBlob]; correctImageIndex : Nat }>>;
    _nextQuestionId : Nat;
  };

  type NewActor = {
    persistentGames : Map.Map<Text, { id : Text; name : Text; description : Text; icon : Text; badges : [Text]; primaryColor : Text; secondaryColor : Text; tags : [Text] }>;
    persistentQuestions : Map.Map<Text, List.List<{ id : Text; image : Storage.ExternalBlob; options : [Text]; correctOption : Text }>>;
    persistentChooseCorrectImageQuestions : Map.Map<Text, List.List<{ id : Text; word : Text; images : [Storage.ExternalBlob]; correctImageIndex : Nat }>>;
    _nextQuestionId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      persistentGames = old.persistentGames;
      persistentQuestions = old.persistentQuestions;
      persistentChooseCorrectImageQuestions = old.persistentChooseCorrectImageQuestions;
      _nextQuestionId = old._nextQuestionId;
    };
  };
};
