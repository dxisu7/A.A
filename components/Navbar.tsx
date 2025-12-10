import React from 'react';

interface NavbarProps {
  credits: number;
  onOpenPricing: () => void;
  onChangeKey: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ credits, onOpenPricing, onChangeKey }) => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Lumina Upscale
            </span>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={onChangeKey}
              className="text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Switch API Key
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <span className="text-sm text-slate-400">Balance:</span>
              <span className="text-sm font-bold text-white">{credits} CR</span>
            </div>
            
            <button
              onClick={onOpenPricing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
            >
              Buy Credits
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;