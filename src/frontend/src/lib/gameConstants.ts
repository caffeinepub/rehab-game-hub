import type { Game } from "@/backend";

// Stable predefined game IDs
export const MATCH_WORD_TO_IMAGE_GAME_ID = "match-word-to-image";
export const CHOOSE_CORRECT_IMAGE_GAME_ID = "choose-correct-image";
export const FIND_THE_ITEM_GAME_ID = "find-the-item";

// Game metadata
export const MATCH_WORD_TO_IMAGE_GAME = {
  id: MATCH_WORD_TO_IMAGE_GAME_ID,
  name: "Choose The Word",
  description:
    "Match the correct word to the displayed image. A fun and engaging way to improve word recognition and cognitive skills.",
  icon: "/assets/uploads/choose-the-word-1.png",
  badges: [],
  primaryColor: "#6B7280",
  secondaryColor: "#9CA3AF",
  tags: ["cognitive", "memory", "word recognition"],
} as const;

export const CHOOSE_CORRECT_IMAGE_GAME = {
  id: CHOOSE_CORRECT_IMAGE_GAME_ID,
  name: "Choose The Image",
  description:
    "See a word and choose the matching image from multiple options. Improve visual recognition and word association skills.",
  icon: "/assets/uploads/choose-the-image-1.png",
  badges: [],
  primaryColor: "#6B7280",
  secondaryColor: "#9CA3AF",
  tags: ["cognitive", "visual", "word association"],
} as const;

export const FIND_THE_ITEM_GAME = {
  id: FIND_THE_ITEM_GAME_ID,
  name: "Find The Item",
  description:
    "Search the scene and tap the correct item. A visual scanning exercise to improve focus and visual search skills.",
  icon: "/assets/uploads/find-the-item-1.png",
  badges: [],
  primaryColor: "#6B7280",
  secondaryColor: "#9CA3AF",
  tags: ["visual", "search", "scanning"],
} as const;

// Map of all predefined games by ID
export const PREDEFINED_GAMES_MAP: Record<string, Game> = {
  [MATCH_WORD_TO_IMAGE_GAME_ID]: {
    ...MATCH_WORD_TO_IMAGE_GAME,
    badges: [...MATCH_WORD_TO_IMAGE_GAME.badges],
    tags: [...MATCH_WORD_TO_IMAGE_GAME.tags],
  },
  [CHOOSE_CORRECT_IMAGE_GAME_ID]: {
    ...CHOOSE_CORRECT_IMAGE_GAME,
    badges: [...CHOOSE_CORRECT_IMAGE_GAME.badges],
    tags: [...CHOOSE_CORRECT_IMAGE_GAME.tags],
  },
  [FIND_THE_ITEM_GAME_ID]: {
    ...FIND_THE_ITEM_GAME,
    badges: [...FIND_THE_ITEM_GAME.badges],
    tags: [...FIND_THE_ITEM_GAME.tags],
  },
};

// Array of all predefined games
export const PREDEFINED_GAMES: Game[] = [
  {
    ...MATCH_WORD_TO_IMAGE_GAME,
    badges: [...MATCH_WORD_TO_IMAGE_GAME.badges],
    tags: [...MATCH_WORD_TO_IMAGE_GAME.tags],
  },
  {
    ...CHOOSE_CORRECT_IMAGE_GAME,
    badges: [...CHOOSE_CORRECT_IMAGE_GAME.badges],
    tags: [...CHOOSE_CORRECT_IMAGE_GAME.tags],
  },
  {
    ...FIND_THE_ITEM_GAME,
    badges: [...FIND_THE_ITEM_GAME.badges],
    tags: [...FIND_THE_ITEM_GAME.tags],
  },
];

/**
 * Merges backend games with predefined game metadata.
 * Ensures all predefined games are always available, even if not in backend.
 * Backend games override predefined metadata if they share the same ID.
 */
export function mergeGamesWithPredefined(backendGames: Game[]): Game[] {
  const gameMap = new Map<string, Game>();

  // First, add all predefined games
  for (const game of PREDEFINED_GAMES) {
    gameMap.set(game.id, game);
  }

  // Then, overlay backend games (they override predefined if same ID)
  for (const game of backendGames) {
    // Only include backend games that match our predefined IDs
    if (PREDEFINED_GAMES_MAP[game.id]) {
      gameMap.set(game.id, game);
    }
  }

  return Array.from(gameMap.values());
}

/**
 * Gets game metadata by ID, falling back to predefined if not found in backend.
 */
export function getGameMetadata(
  gameId: string,
  backendGame?: Game | null,
): Game | null {
  if (backendGame) {
    return backendGame;
  }
  return PREDEFINED_GAMES_MAP[gameId] || null;
}
