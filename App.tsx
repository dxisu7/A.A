import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PricingModal from './components/PricingModal';
import UpscaleControls from './components/UpscaleControls';
import { CreditPackage, UpscaleResolution, ProcessingState } from './types';
import { UPSCALE_OPTIONS } from './constants';
import { checkApiKey, promptApiKeySelection, upscaleImage, convertBlobToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [credits, setCredits] = useState<number>(0);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [selectedResolution, setSelectedResolution] = useState<UpscaleResolution>(UpscaleResolution.Res4K);
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize checks
  useEffect(() => {
    checkApiKey().then((hasKey) => {
      if (!hasKey) {
        // We prompt immediately if no key is found, 
        // effectively gating the app as per instructions for Pro/Veo models.
        promptApiKeySelection();
      }
    });
  }, []);

  const handlePurchase = (pkg: CreditPackage) => {
    // Simulation of payment processing
    setCredits(prev => prev + pkg.credits);
    setIsPricingOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProcessingState(prev => ({ ...prev, error: 'Please upload a valid image file.' }));
        return;
      }
      try {
        const base64 = await convertBlobToBase64(file);
        setOriginalImage(base64);
        setResultImage(null);
        setProcessingState({ isProcessing: false, progress: 0, error: null });
      } catch (e) {
        setProcessingState(prev => ({ ...prev, error: 'Failed to read file.' }));
      }
    }
  };

  const handleUpscale = async () => {
    const option = UPSCALE_OPTIONS.find(o => o.resolution === selectedResolution);
    if (!option || !originalImage) return;

    if (credits < option.cost) {
      setIsPricingOpen(true);
      return;
    }

    // Double check API key before calling
    const hasKey = await checkApiKey();
    if (!hasKey) {
      await promptApiKeySelection();
      // We stop here and let the user re-click after selecting key
      return;
    }

    setProcessingState({ isProcessing: true, progress: 10, error: null });

    try {
      // Simulate progress steps since the API doesn't provide stream progress for generation
      const progressInterval = setInterval(() => {
        setProcessingState(prev => {
          if (prev.progress >= 90) return prev;
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 800);

      const result = await upscaleImage(originalImage, selectedResolution);
      
      clearInterval(progressInterval);
      setResultImage(result);
      setCredits(prev => prev - option.cost);
      setProcessingState({ isProcessing: false, progress: 100, error: null });
      
    } catch (error: any) {
      setProcessingState({ 
        isProcessing: false, 
        progress: 0, 
        error: error.message || 'Upscaling failed. Please try again.' 
      });
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `upscaled-${selectedResolution}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearImages = () => {
    setOriginalImage(null);
    setResultImage(null);
    setProcessingState({ isProcessing: false, progress: 0, error: null });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Navbar 
        credits={credits} 
        onOpenPricing={() => setIsPricingOpen(true)} 
        onChangeKey={promptApiKeySelection}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Toast */}
        {processingState.error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg flex justify-between items-center animate-fade-in">
            <span>{processingState.error}</span>
            <button onClick={() => setProcessingState(prev => ({...prev, error: null}))} className="hover:text-white">
                &times;
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {!originalImage ? (
          // Empty State - Upload
          <div className="min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-3xl bg-slate-900/50 hover:bg-slate-900 transition-colors p-10 text-center">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">Upload an image to start</h2>
             <p className="text-slate-400 max-w-md mb-8">
               Drag and drop your image here, or click to browse. We support PNG, JPG, and WEBP.
             </p>
             <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
             />
             <label
                htmlFor="file-upload"
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
             >
                Select Image
             </label>
          </div>
        ) : (
          // Workspace
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            
            {/* Left: Image Viewer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-white">
                    {resultImage ? 'Upscaled Result' : 'Original Image'}
                </h2>
                <button onClick={clearImages} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear Workspace
                </button>
              </div>

              <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden flex items-center justify-center group">
                {processingState.isProcessing && (
                  <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium text-white animate-pulse">Upscaling...</p>
                    <div className="w-64 h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                            style={{ width: `${processingState.progress}%` }}
                        ></div>
                    </div>
                  </div>
                )}
                
                <img 
                  src={resultImage || originalImage} 
                  alt="Workspace" 
                  className="max-w-full max-h-full object-contain"
                />
                
                {resultImage && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button 
                            onClick={() => setResultImage(null)}
                            className="bg-slate-800/90 hover:bg-slate-700 text-white p-2 rounded-lg backdrop-blur shadow-lg border border-slate-600 text-sm"
                        >
                            Show Original
                        </button>
                         <button 
                            onClick={handleDownload}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
                        >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download
                        </button>
                    </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500">Source</p>
                          <p className="text-sm font-medium text-slate-200">Original Upload</p>
                      </div>
                  </div>
                   <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500">Target Resolution</p>
                          <p className="text-sm font-medium text-slate-200">{selectedResolution}</p>
                      </div>
                  </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div>
              <UpscaleControls 
                selectedResolution={selectedResolution}
                onSelect={setSelectedResolution}
                onUpscale={handleUpscale}
                disabled={processingState.isProcessing}
                userCredits={credits}
              />
            </div>

          </div>
        )}
      </main>

      <PricingModal 
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onPurchase={handlePurchase}
      />
    </div>
  );
};

export default App;