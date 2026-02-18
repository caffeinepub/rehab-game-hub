import type { ExternalBlob } from '@/backend';

export interface ChooseCorrectImageQuestion {
  id: string;
  word: string;
  images: ExternalBlob[];
  correctImageIndex: number;
}
