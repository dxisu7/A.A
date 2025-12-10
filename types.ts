
export enum UpscaleResolution {
  Res2K = '2K',
  Res4K = '4K',
  Res8K = '8K',
  Res16K = '16K'
}

export type UpscaleMode = 'standard' | 'denoise' | 'portrait' | 'night' | 'anime';

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  featured?: boolean;
}

export interface UpscaleOption {
  resolution: UpscaleResolution;
  cost: number;
  label: string;
  description: string;
}

export interface UserState {
  credits: number;
  hasApiKey: boolean;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0-100
  error: string | null;
  currentItemIndex: number;
  totalItems: number;
}

export interface UpscaleQueueItem {
  id: string;
  fileName: string;
  originalBase64: string;
  resultBase64?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}
