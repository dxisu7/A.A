
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from '../constants';
import { UpscaleResolution, UpscaleMode } from '../types';

interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

export const getGeminiClient = (): GoogleGenAI => {
  // Ensure we get the fresh key from process.env which is populated by the window.aistudio selector
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

const getAIStudio = (): AIStudio | undefined => {
  return (window as any).aistudio;
};

export const checkApiKey = async (): Promise<boolean> => {
  const aistudio = getAIStudio();
  if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
    return await aistudio.hasSelectedApiKey();
  }
  return false;
};

export const promptApiKeySelection = async (): Promise<void> => {
  const aistudio = getAIStudio();
  if (aistudio && typeof aistudio.openSelectKey === 'function') {
    await aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selector not available in this environment.");
  }
};

const getImageDimensions = (base64: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = base64;
  });
};

const getClosestAspectRatio = (width: number, height: number): string => {
  const ratio = width / height;
  const supported = [
    { str: "1:1", val: 1 },
    { str: "3:4", val: 3/4 },
    { str: "4:3", val: 4/3 },
    { str: "9:16", val: 9/16 },
    { str: "16:9", val: 16/9 }
  ];
  
  // Find closest supported aspect ratio
  return supported.reduce((prev, curr) => 
    Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev
  ).str;
};

export const upscaleImage = async (
  base64Image: string, 
  resolution: UpscaleResolution,
  mode: UpscaleMode = 'standard'
): Promise<string> => {
  const client = getGeminiClient();

  // Gemini currently supports up to 4K output generation explicitly via imageSize.
  // We map the user's "Upscale" request to the closest valid API parameter for the config.
  // Note: 16K is not natively supported by imageSize config, so we rely on prompt + max available size (4K) 
  // and the model's ability to generate high density detail.
  let targetSize = "2K";
  if (resolution === UpscaleResolution.Res4K || resolution === UpscaleResolution.Res8K || resolution === UpscaleResolution.Res16K) {
    targetSize = "4K";
  }

  // Calculate dynamic aspect ratio to prevent cropping.
  const dimensions = await getImageDimensions(base64Image);
  const aspectRatio = getClosestAspectRatio(dimensions.width, dimensions.height);

  // Define specific pixel targets for the prompt instructions
  let resolutionDetail = "high resolution";
  let pixelTarget = "";
  
  switch (resolution) {
    case UpscaleResolution.Res2K:
      resolutionDetail = "QHD or 2K";
      pixelTarget = "2560 x 1440 pixels";
      break;
    case UpscaleResolution.Res4K:
      resolutionDetail = "UHD or 4K";
      pixelTarget = "3840 x 2160 pixels";
      break;
    case UpscaleResolution.Res8K:
      resolutionDetail = "UHD 8K";
      pixelTarget = "7680 × 4320 pixels";
      break;
    case UpscaleResolution.Res16K:
      resolutionDetail = "UHD 16K";
      pixelTarget = "15360 x 8640 pixels";
      break;
  }

  // Determine mode specific instruction
  let modeInstruction = "Style: Photorealistic, high definition, sharp details.";
  switch (mode) {
    case 'denoise':
      modeInstruction = "Focus on noise reduction, removing grain, and sharpening edges while maintaining natural textures.";
      break;
    case 'portrait':
      modeInstruction = "Focus on facial enhancement, realistic skin texture, clear eyes, and natural lighting correction for portraits.";
      break;
    case 'night':
      modeInstruction = "Focus on low-light enhancement, noise reduction in shadows, and dynamic range improvement for night scenes.";
      break;
    case 'anime':
      modeInstruction = "Focus on anime/cartoon style preservation, sharp line art, vibrant colors, and 2D rendering aesthetics.";
      break;
  }

  // Enhanced prompt to strictly prevent cropping and enforce specific resolution targets
  const promptText = `Upscale this image to ${resolutionDetail} resolution (${pixelTarget}).
  
  CRITICAL INSTRUCTIONS TO PREVENT CROPPING AND ZOOMING:
  1. PRESERVE THE EXACT COMPOSITION AND FIELD OF VIEW of the original image.
  2. DO NOT CROP any part of the image.
  3. DO NOT ZOOM IN. The borders of the output must match the borders of the input.
  4. If the requested aspect ratio (${aspectRatio}) differs slightly from the input (${dimensions.width}x${dimensions.height}), you must fit the ENTIRE image content within the frame, adding padding if absolutely necessary, rather than cropping.
  5. The goal is a high-fidelity upscale, not a re-composition.
  
  Output Specifications:
  - Resolution target: ${pixelTarget}
  - ${modeInstruction}
  `;

  // Clean the base64 string if it has a prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  
  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', // Assuming PNG for high quality
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        imageConfig: {
          imageSize: targetSize, // "1K", "2K", "4K"
          aspectRatio: aspectRatio, // Dynamic aspect ratio matches input to prevent cropping
        },
      },
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated by the model.");

  } catch (error) {
    console.error("Upscale error:", error);
    throw error;
  }
};

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};
