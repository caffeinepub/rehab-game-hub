// Stable predefined game ID for Match Word to Image
export const MATCH_WORD_TO_IMAGE_GAME_ID = 'match-word-to-image';

// Game metadata
export const MATCH_WORD_TO_IMAGE_GAME = {
  id: MATCH_WORD_TO_IMAGE_GAME_ID,
  name: 'Match Word to Image',
  description: 'Match the correct word to the displayed image. A fun and engaging way to improve word recognition and cognitive skills.',
  icon: '/assets/generated/game-thumbnail-placeholder.dim_800x600.png',
  badges: [],
  primaryColor: '#6B7280',
  secondaryColor: '#9CA3AF',
  tags: ['cognitive', 'memory', 'word recognition'],
} as const;
