import React from 'react';
import { UPSCALE_OPTIONS } from '../constants';
import { UpscaleOption, UpscaleResolution } from '../types';

interface UpscaleControlsProps {
  selectedResolution: UpscaleResolution;
  onSelect: (resolution: UpscaleResolution) => void;
  onUpscale: () => void;
  disabled: boolean;
  userCredits: number;
}

const UpscaleControls: React.FC<UpscaleControlsProps> = ({ 
  selectedResolution, 
  onSelect, 
  onUpscale,
  disabled,
  userCredits
}) => {
  const selectedOption = UPSCALE_OPTIONS.find(o => o.resolution === selectedResolution) || UPSCALE_OPTIONS[1];
  const canAfford = userCredits >= selectedOption.cost;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">Upscale Configuration</h3>
      
      <div className="space-y-3 flex-1">
        {UPSCALE_OPTIONS.map((option) => (
          <div
            key={option.resolution}
            onClick={() => !disabled && onSelect(option.resolution)}
            className={`
              relative p-4 rounded-lg cursor-pointer border-2 transition-all duration-200
              ${selectedResolution === option.resolution 
                ? 'border-indigo-500 bg-indigo-900/20' 
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold ${selectedResolution === option.resolution ? 'text-white' : 'text-slate-300'}`}>
                {option.label}
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${selectedResolution === option.resolution ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {option.cost} Credits
              </span>
            </div>
            <p className="text-xs text-slate-500">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-slate-400">Current Balance:</span>
          <span className={userCredits < selectedOption.cost ? 'text-red-400 font-bold' : 'text-white font-bold'}>
            {userCredits} Credits
          </span>
        </div>
        
        <button
          onClick={onUpscale}
          disabled={disabled || !canAfford}
          className={`
            w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all
            ${disabled || !canAfford
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-500/25'}
          `}
        >
          {!canAfford 
            ? `Need ${selectedOption.cost - userCredits} More Credits` 
            : disabled 
              ? 'Processing...' 
              : `Upscale to ${selectedOption.resolution}`}
        </button>
      </div>
    </div>
  );
};

export default UpscaleControls;