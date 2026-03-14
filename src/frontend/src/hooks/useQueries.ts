import type {
  ChooseCorrectImageQuestion,
  ExternalBlob,
  Game,
  MatchWordToImageQuestion,
  PlayerSession,
  QuestionId,
} from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetAllGames() {
  const { actor, isFetching } = useActor();

  return useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGameById(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Game>({
    queryKey: ["game", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getGameById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (game: Game) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.createGame(
        game.id,
        game.name,
        game.description,
        game.icon,
        game.badges,
        game.primaryColor,
        game.secondaryColor,
        game.tags,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUpdateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (game: Game) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.updateGame(
        game.id,
        game.name,
        game.description,
        game.icon,
        game.badges,
        game.primaryColor,
        game.secondaryColor,
        game.tags,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_gameId: string) => {
      // Backend delete not yet implemented
      throw new Error("Delete functionality not yet available");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

// Question CRUD hooks for Match Word to Image

export function useGetAllQuestions(gameId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MatchWordToImageQuestion[]>({
    queryKey: ["questions", gameId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions(gameId);
    },
    enabled: !!actor && !isFetching && !!gameId,
  });
}

export function useCreateQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      image,
      options,
      correctOption,
    }: {
      gameId: string;
      image: ExternalBlob;
      options: string[];
      correctOption: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");

      if (options.length < 2) {
        throw new Error("At least 2 options are required");
      }

      if (!options.includes(correctOption)) {
        throw new Error("Correct option must be one of the provided options");
      }

      const questionId = await actor.createQuestion(
        gameId,
        image,
        options,
        correctOption,
      );
      return questionId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["questions", variables.gameId],
      });
    },
  });
}

// Question CRUD hooks for Choose Correct Image

export function useGetAllChooseCorrectImageQuestions(gameId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ChooseCorrectImageQuestion[]>({
    queryKey: ["chooseCorrectImageQuestions", gameId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChooseCorrectImageQuestions(gameId);
    },
    enabled: !!actor && !isFetching && !!gameId,
  });
}

export function useCreateChooseCorrectImageQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      word,
      images,
      correctImageIndex,
    }: {
      gameId: string;
      word: string;
      images: ExternalBlob[];
      correctImageIndex: number;
    }) => {
      if (!actor) throw new Error("Actor not initialized");

      if (!word.trim()) {
        throw new Error("Word cannot be empty");
      }

      if (images.length < 2) {
        throw new Error("At least 2 images are required");
      }

      if (correctImageIndex < 0 || correctImageIndex >= images.length) {
        throw new Error(
          "Correct image index must be within the range of provided images",
        );
      }

      // Convert number to bigint for backend
      const createdQuestion = await actor.createChooseCorrectImageQuestion(
        gameId,
        word.trim(),
        images,
        BigInt(correctImageIndex),
      );
      return createdQuestion;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chooseCorrectImageQuestions", variables.gameId],
      });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      questionId,
      image,
      options,
      correctOption,
    }: {
      gameId: string;
      questionId: QuestionId;
      image: ExternalBlob;
      options: string[];
      correctOption: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");

      if (options.length < 2) {
        throw new Error("At least 2 options are required");
      }

      if (!options.includes(correctOption)) {
        throw new Error("Correct option must be one of the provided options");
      }

      await actor.updateQuestion(
        gameId,
        questionId,
        image,
        options,
        correctOption,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["questions", variables.gameId],
      });
    },
  });
}

export function useUpdateChooseCorrectImageQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      questionId,
      word,
      images,
      correctImageIndex,
    }: {
      gameId: string;
      questionId: string;
      word: string;
      images: ExternalBlob[];
      correctImageIndex: number;
    }) => {
      if (!actor) throw new Error("Actor not initialized");

      if (!word.trim()) {
        throw new Error("Word cannot be empty");
      }

      if (images.length < 1) {
        throw new Error("At least 1 image is required");
      }

      if (correctImageIndex < 0 || correctImageIndex >= images.length) {
        throw new Error(
          "Correct image index must be within the range of provided images",
        );
      }

      await actor.updateChooseCorrectImageQuestion(
        gameId,
        questionId,
        word.trim(),
        images,
        BigInt(correctImageIndex),
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chooseCorrectImageQuestions", variables.gameId],
      });
    },
  });
}

// Player session hooks

export function useGetMyGameSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<PlayerSession[]>({
    queryKey: ["myGameSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyGameSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveGameSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      gameName,
      correct,
      wrong,
      durationSeconds,
    }: {
      gameId: string;
      gameName: string;
      correct: number;
      wrong: number;
      durationSeconds: number;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.saveGameSession(
        gameId,
        gameName,
        BigInt(correct),
        BigInt(wrong),
        BigInt(durationSeconds),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGameSessions"] });
    },
  });
}
