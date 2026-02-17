import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Game, MatchWordToImageQuestion, QuestionId, ExternalBlob } from '@/backend';

export function useGetAllGames() {
  const { actor, isFetching } = useActor();

  return useQuery<Game[]>({
    queryKey: ['games'],
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
    queryKey: ['game', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
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
      if (!actor) throw new Error('Actor not initialized');
      await actor.createGame(
        game.id,
        game.name,
        game.description,
        game.icon,
        game.badges,
        game.primaryColor,
        game.secondaryColor,
        game.tags
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (game: Game) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateGame(
        game.id,
        game.name,
        game.description,
        game.icon,
        game.badges,
        game.primaryColor,
        game.secondaryColor,
        game.tags
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      // Backend delete not yet implemented
      throw new Error('Delete functionality not yet available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

// Question CRUD hooks for Match Word to Image

export function useGetAllQuestions(gameId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MatchWordToImageQuestion[]>({
    queryKey: ['questions', gameId],
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
      if (!actor) throw new Error('Actor not initialized');
      
      if (options.length !== 3) {
        throw new Error('Exactly 3 options are required');
      }
      
      if (!options.includes(correctOption)) {
        throw new Error('Correct option must be one of the provided options');
      }

      const questionId = await actor.createQuestion(gameId, image, options, correctOption);
      return questionId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', variables.gameId] });
    },
  });
}
