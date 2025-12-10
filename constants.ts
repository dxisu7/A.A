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
    label: '2K Upscale',
    description: 'Great for web usage and HD screens.',
  },
  {
    resolution: UpscaleResolution.Res4K,
    cost: 4,
    label: '4K Upscale',
    description: 'Perfect for printing and 4K displays.',
  },
  {
    resolution: UpscaleResolution.Res8K,
    cost: 8,
    label: '8K Ultra',
    description: 'Extreme detail for large format print.',
  },
  {
    resolution: UpscaleResolution.Res16K,
    cost: 12,
    label: '16K Max',
    description: 'Maximum possible clarity and sharpness.',
  }
];

export const MODEL_NAME = 'gemini-3-pro-image-preview';
