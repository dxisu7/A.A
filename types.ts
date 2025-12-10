export enum UpscaleResolution {
  Res2K = '2K',
  Res4K = '4K',
  Res8K = '8K',
  Res16K = '16K'
}

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
}
