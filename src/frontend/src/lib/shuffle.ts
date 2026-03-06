/**
 * Shuffles an array using Fisher-Yates algorithm
 * Returns a new shuffled array without modifying the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffles question options while tracking which one is correct
 * Returns shuffled options and the new index of the correct option
 */
export function shuffleOptions(
  options: string[],
  correctOption: string,
): { shuffledOptions: string[]; correctIndex: number } {
  const shuffled = shuffleArray(options);
  const correctIndex = shuffled.indexOf(correctOption);
  return { shuffledOptions: shuffled, correctIndex };
}
