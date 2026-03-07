import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type GameId = Text;
  let VR_GAME_ID = "vr-find-x";
  let CHOOSE_CORRECT_IMAGE_GAME_ID = "choose-correct-image";
  let CORRECT_IMAGE_QUESTIONS = "choose-correct-image-questions";

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

  public type QuestionId = Text;
  public type Option = Text;

  public type MatchWordToImageQuestion = {
    id : QuestionId;
    image : Storage.ExternalBlob;
    options : [Option];
    correctOption : Option;
  };

  public type ChooseCorrectImageQuestion = {
    id : Text;
    word : Text;
    images : [Storage.ExternalBlob];
    correctImageIndex : Nat;
  };

  var persistentGames = Map.empty<GameId, Game>();
  var persistentQuestions = Map.empty<GameId, List.List<MatchWordToImageQuestion>>();
  var persistentChooseCorrectImageQuestions = Map.empty<GameId, List.List<ChooseCorrectImageQuestion>>();
  var _nextQuestionId = 0;

  public shared ({ caller }) func createGame(
    id : GameId,
    name : Text,
    description : Text,
    icon : Text,
    badges : [Text],
    primaryColor : Text,
    secondaryColor : Text,
    tags : [Text],
  ) : async () {
    let newGame = {
      id;
      name;
      description;
      icon;
      badges;
      primaryColor;
      secondaryColor;
      tags;
    };
    persistentGames.add(id, newGame);
  };

  public shared ({ caller }) func updateGame(
    id : GameId,
    name : Text,
    description : Text,
    icon : Text,
    badges : [Text],
    primaryColor : Text,
    secondaryColor : Text,
    tags : [Text],
  ) : async () {
    if (persistentGames.containsKey(id)) {
      let updatedGame = {
        id;
        name;
        description;
        icon;
        badges;
        primaryColor;
        secondaryColor;
        tags;
      };
      persistentGames.add(id, updatedGame);
    } else {
      Runtime.trap("Game with specified ID does not exist.");
    };
  };

  public query ({ caller }) func getAllGames() : async [Game] {
    persistentGames.values().toArray();
  };

  public query ({ caller }) func getGameById(id : GameId) : async Game {
    switch (persistentGames.get(id)) {
      case (?game) { game };
      case (null) {
        Runtime.trap("Game with specified ID does not exist.");
      };
    };
  };

  public query ({ caller }) func getGamesByTag(tag : Text) : async [Game] {
    persistentGames.values().toArray().filter(
      func(game) {
        game.tags.find(
          func(gameTag) {
            gameTag == tag;
          }
        ) != null;
      }
    );
  };

  public shared ({ caller }) func createQuestion(
    gameId : GameId,
    image : Storage.ExternalBlob,
    options : [Option],
    correctOption : Option,
  ) : async QuestionId {
    if (options.size() < 2) {
      Runtime.trap("At least 2 options are required.");
    };

    let questionId = _nextQuestionId.toText();
    _nextQuestionId += 1;

    let newQuestion : MatchWordToImageQuestion = {
      id = questionId;
      image;
      options;
      correctOption;
    };

    switch (persistentQuestions.get(gameId)) {
      case (null) {
        let newList = List.empty<MatchWordToImageQuestion>();
        newList.add(newQuestion);
        persistentQuestions.add(gameId, newList);
      };
      case (?existingQuestions) {
        existingQuestions.add(newQuestion);
      };
    };
    questionId;
  };

  public shared ({ caller }) func updateQuestion(
    gameId : GameId,
    questionId : QuestionId,
    image : Storage.ExternalBlob,
    options : [Option],
    correctOption : Option,
  ) : async () {
    if (options.size() < 2) {
      Runtime.trap("At least 2 options are required.");
    };

    if (not persistentQuestions.containsKey(gameId)) {
      Runtime.trap("Game with specified ID does not exist.");
    };

    let updatedQuestion : MatchWordToImageQuestion = {
      id = questionId;
      image;
      options;
      correctOption;
    };

    switch (persistentQuestions.get(gameId)) {
      case (null) {
        Runtime.trap("No questions found for game. This should not happen, as game existence is checked before.");
      };
      case (?questions) {
        if (questions.isEmpty()) {
          Runtime.trap("No questions found for game. This should not happen, as game existence is checked before.");
        };

        var found = false;
        let newQuestions = questions.map<MatchWordToImageQuestion, MatchWordToImageQuestion>(
          func(question) {
            if (question.id == questionId) {
              found := true;
              updatedQuestion;
            } else {
              question;
            };
          }
        );

        if (not found) {
          Runtime.trap("Question with specified ID does not exist.");
        };

        persistentQuestions.add(gameId, newQuestions);
      };
    };
  };

  public query ({ caller }) func getAllQuestions(gameId : GameId) : async [MatchWordToImageQuestion] {
    switch (persistentQuestions.get(gameId)) {
      case (null) { [] };
      case (?questions) { questions.toArray() };
    };
  };

  public query ({ caller }) func getQuestion(gameId : GameId, questionId : QuestionId) : async ?MatchWordToImageQuestion {
    switch (persistentQuestions.get(gameId)) {
      case (null) { null };
      case (?questions) {
        let found = questions.values().find(
          func(question) {
            question.id == questionId;
          }
        );
        found;
      };
    };
  };

  public shared ({ caller }) func createChooseCorrectImageQuestion(
    gameId : GameId,
    word : Text,
    images : [Storage.ExternalBlob],
    correctImageIndex : Nat,
  ) : async ChooseCorrectImageQuestion {
    if (images.size() < 2) {
      Runtime.trap("At least 2 images are required.");
    };

    if (correctImageIndex >= images.size()) {
      Runtime.trap("Correct image index must be between 0 and " # (images.size() - 1).toText() # ".");
    };

    let newQuestion : ChooseCorrectImageQuestion = {
      id = word;
      word;
      images;
      correctImageIndex;
    };

    switch (persistentChooseCorrectImageQuestions.get(gameId)) {
      case (null) {
        let newList = List.empty<ChooseCorrectImageQuestion>();
        newList.add(newQuestion);
        persistentChooseCorrectImageQuestions.add(gameId, newList);
      };
      case (?existingQuestions) {
        existingQuestions.add(newQuestion);
      };
    };
    newQuestion;
  };

  public shared ({ caller }) func updateChooseCorrectImageQuestion(
    gameId : GameId,
    questionId : Text,
    word : Text,
    images : [Storage.ExternalBlob],
    correctImageIndex : Nat,
  ) : async () {
    if (images.size() < 2) {
      Runtime.trap("At least 2 images are required.");
    };

    if (correctImageIndex >= images.size()) {
      Runtime.trap("Correct image index must be between 0 and " # (images.size() - 1).toText() # ".");
    };

    if (not persistentChooseCorrectImageQuestions.containsKey(gameId)) {
      Runtime.trap("Game with specified ID does not exist.");
    };

    let updatedQuestion : ChooseCorrectImageQuestion = {
      id = questionId;
      word;
      images;
      correctImageIndex;
    };

    switch (persistentChooseCorrectImageQuestions.get(gameId)) {
      case (null) {
        Runtime.trap("No questions found for game. This should not happen, as game existence is checked before.");
      };
      case (?questions) {
        if (questions.isEmpty()) {
          Runtime.trap("No questions found for game. This should not happen, as game existence is checked before.");
        };

        var found = false;
        let newQuestions = questions.map<ChooseCorrectImageQuestion, ChooseCorrectImageQuestion>(
          func(question) {
            if (question.id == questionId) {
              found := true;
              updatedQuestion;
            } else {
              question;
            };
          }
        );

        if (not found) {
          Runtime.trap("Question with specified ID does not exist.");
        };

        persistentChooseCorrectImageQuestions.add(gameId, newQuestions);
      };
    };
  };

  public query ({ caller }) func getAllChooseCorrectImageQuestions(gameId : GameId) : async [ChooseCorrectImageQuestion] {
    switch (persistentChooseCorrectImageQuestions.get(gameId)) {
      case (null) { [] };
      case (?questions) { questions.toArray() };
    };
  };
};
