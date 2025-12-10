
import { CreditPackage, UpscaleOption, UpscaleResolution } from './types';

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    credits: 100,
    price: 39,
    featured: false,
  },
  {
    id: 'pro',
    credits: 500,
    price: 149,
    featured: true,
  },
  {
    id: 'studio',
    credits: 1000,
    price: 299,
    featured: false,
  },
  {
    id: 'enterprise',
    credits: 10000,
    price: 2799,
    featured: false,
  }
];

export const UPSCALE_OPTIONS: UpscaleOption[] = [
  {
    resolution: UpscaleResolution.Res2K,
    cost: 2,
    label: '2K QHD',
    description: 'QHD or 2K or 1440p - 2560 x 1440 pixels',
  },
  {
    resolution: UpscaleResolution.Res4K,
    cost: 4,
    label: '4K UHD',
    description: 'UHD or 4K or 2160p - 3840 x 2160 pixels',
  },
  {
    resolution: UpscaleResolution.Res8K,
    cost: 8,
    label: '8K UHD',
    description: 'UHD 8K or 4320p - 7680 × 4320 pixels',
  },
  {
    resolution: UpscaleResolution.Res16K,
    cost: 12,
    label: '16K UHD',
    description: 'UHD 16K or 8640p - 15360 x 8640 pixels',
  }
];

export const UPSCALE_MODES = [
  { value: 'standard', label: 'Standard' },
  { value: 'denoise', label: 'Denoise / Sharpen' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'night', label: 'Night / Low Light' },
  { value: 'anime', label: 'Anime / Cartoon' },
];

export const MODEL_NAME = 'gemini-3-pro-image-preview';
