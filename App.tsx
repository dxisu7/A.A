
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import PricingModal from './components/PricingModal';
import UpscaleControls from './components/UpscaleControls';
import ImageComparisonSlider from './components/ImageComparisonSlider';
import { CreditPackage, UpscaleResolution, ProcessingState, UpscaleQueueItem, UpscaleMode } from './types';
import { UPSCALE_OPTIONS } from './constants';
import { checkApiKey, promptApiKeySelection, upscaleImage, convertBlobToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [credits, setCredits] = useState<number>(0);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [selectedResolution, setSelectedResolution] = useState<UpscaleResolution>(UpscaleResolution.Res4K);
  const [selectedMode, setSelectedMode] = useState<UpscaleMode>('standard');
  
  const [queue, setQueue] = useState<UpscaleQueueItem[]>([]);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    currentItemIndex: 0,
    totalItems: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey().then((hasKey) => {
      if (!hasKey) {
        promptApiKeySelection();
      }
    });
  }, []);

  const handlePurchase = (pkg: CreditPackage) => {
    setCredits(prev => prev + pkg.credits);
    setIsPricingOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newItems: UpscaleQueueItem[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          try {
            const base64 = await convertBlobToBase64(file);
            newItems.push({
              id: Math.random().toString(36).substring(7),
              fileName: file.name,
              originalBase64: base64,
              status: 'pending'
            });
          } catch (e) {
            console.error("Failed to read file", file.name);
          }
        }
      }

      setQueue(prev => [...prev, ...newItems]);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status !== 'completed'));
  };

  const clearAll = () => {
    setQueue([]);
    setProcessingState({ isProcessing: false, progress: 0, error: null, currentItemIndex: 0, totalItems: 0 });
  };

  const processQueue = async () => {
    const pendingItems = queue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    const option = UPSCALE_OPTIONS.find(o => o.resolution === selectedResolution);
    if (!option) return;

    if (credits < option.cost * pendingItems.length) {
      setIsPricingOpen(true);
      return;
    }

    const hasKey = await checkApiKey();
    if (!hasKey) {
      await promptApiKeySelection();
      return;
    }

    setProcessingState({
      isProcessing: true,
      progress: 0,
      error: null,
      currentItemIndex: 0,
      totalItems: pendingItems.length
    });

    let currentCredits = credits;

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      
      setProcessingState(prev => ({
        ...prev,
        currentItemIndex: i + 1,
        progress: 10
      }));

      // Update item status to processing
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'processing' } : q));

      try {
        // Simulate progress for UX
        const progressInterval = setInterval(() => {
          setProcessingState(prev => {
             if (prev.progress >= 90) return prev;
             return { ...prev, progress: prev.progress + 15 };
          });
        }, 500);

        const result = await upscaleImage(item.originalBase64, selectedResolution, selectedMode);
        
        clearInterval(progressInterval);
        
        currentCredits -= option.cost;
        setCredits(currentCredits);

        setQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: 'completed', 
          resultBase64: result 
        } : q));

      } catch (error: any) {
        setQueue(prev => prev.map(q => q.id === item.id ? { 
          ...q, 
          status: 'error', 
          error: error.message || 'Failed' 
        } : q));
      }
    }

    setProcessingState({
      isProcessing: false,
      progress: 0,
      error: null,
      currentItemIndex: 0,
      totalItems: 0
    });
  };

  const downloadAll = () => {
    queue.filter(item => item.status === 'completed' && item.resultBase64).forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.resultBase64!;
        link.download = `upscaled-${item.fileName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Navbar 
        credits={credits} 
        onOpenPricing={() => setIsPricingOpen(true)} 
        onChangeKey={promptApiKeySelection}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Processing Overlay/Toast */}
        {processingState.isProcessing && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-up">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="animate-spin w-12 h-12 text-indigo-500 absolute" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs font-bold text-white z-10">{Math.round((processingState.currentItemIndex / processingState.totalItems) * 100)}%</span>
            </div>
            <div>
              <p className="font-bold text-white">Processing Batch...</p>
              <p className="text-xs text-slate-400">Image {processingState.currentItemIndex} of {processingState.totalItems}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Workspace */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold text-white">Workspace</h2>
               <div className="flex gap-3">
                  {queue.length > 0 && (
                    <button onClick={clearAll} className="text-sm text-slate-400 hover:text-white">
                      Clear All
                    </button>
                  )}
                  {queue.some(i => i.status === 'completed') && (
                     <button onClick={downloadAll} className="text-sm bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1 rounded-full border border-slate-700 transition-colors">
                       Download Completed
                     </button>
                  )}
               </div>
            </div>

            {/* Queue List */}
            {queue.length === 0 ? (
               <div className="min-h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30 p-10 text-center hover:bg-slate-900/50 transition-colors group">
                 <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Upload Images</h2>
                 <p className="text-slate-400 mb-8 max-w-sm">Support for PNG, JPG, WEBP. Select multiple files to process in batch.</p>
                 <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                 />
                 <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
                 >
                    Select Images
                 </label>
              </div>
            ) : (
              <div className="space-y-6">
                 {/* Pending / Processing Items */}
                 {queue.filter(i => i.status !== 'completed').length > 0 && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {queue.filter(i => i.status !== 'completed').map(item => (
                       <div key={item.id} className="bg-slate-900 rounded-xl p-3 flex gap-3 border border-slate-800 relative overflow-hidden">
                          <img src={item.originalBase64} className="w-20 h-20 object-cover rounded-lg bg-slate-800" alt="Thumbnail" />
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-sm font-medium text-white truncate">{item.fileName}</h4>
                            <p className="text-xs text-slate-500 mt-1 capitalize">{item.status}</p>
                            {item.status === 'processing' && (
                               <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-indigo-500 animate-progress"></div>
                               </div>
                            )}
                            {item.status === 'error' && (
                                <p className="text-xs text-red-400 mt-1">{item.error}</p>
                            )}
                          </div>
                          <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                       </div>
                     ))}
                     
                     {/* Add more button */}
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-900/50 rounded-xl p-3 flex flex-col items-center justify-center border border-dashed border-slate-700 cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition-colors min-h-[100px]"
                     >
                        <svg className="w-6 h-6 text-slate-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs text-slate-500">Add more</span>
                     </div>
                   </div>
                 )}

                 {/* Completed Items */}
                 {queue.filter(i => i.status === 'completed').map(item => (
                   <div key={item.id} className="animate-fade-in">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="text-white font-medium text-sm">{item.fileName}</h3>
                          <span className="text-xs text-green-400 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             Upscaled Successfully
                          </span>
                        </div>
                        <div className="flex gap-2">
                            <a 
                               href={item.resultBase64} 
                               download={`upscaled-${item.fileName}`}
                               className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                            </a>
                            <button onClick={() => removeItem(item.id)} className="text-xs bg-slate-800 text-slate-400 px-2 py-1.5 rounded-md hover:text-white">
                                Remove
                            </button>
                        </div>
                      </div>
                      
                      <ImageComparisonSlider 
                        original={item.originalBase64} 
                        upscaled={item.resultBase64!} 
                      />
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div>
            <UpscaleControls 
              selectedResolution={selectedResolution}
              selectedMode={selectedMode}
              onSelectResolution={setSelectedResolution}
              onSelectMode={setSelectedMode}
              onUpscale={processQueue}
              disabled={processingState.isProcessing}
              userCredits={credits}
              queueSize={queue.filter(i => i.status === 'pending').length}
            />
          </div>

        </div>
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
