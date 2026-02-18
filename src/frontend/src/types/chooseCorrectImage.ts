import type { ChooseCorrectImageQuestion as BackendChooseCorrectImageQuestion } from '@/backend';

// Re-export the backend type directly to avoid drift
export type { ChooseCorrectImageQuestion } from '@/backend';

// Helper to convert bigint to number for UI usage
export function getCorrectImageIndex(question: BackendChooseCorrectImageQuestion): number {
  return Number(question.correctImageIndex);
}
