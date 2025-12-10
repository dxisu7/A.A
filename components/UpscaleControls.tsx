
import React from 'react';
import { UPSCALE_OPTIONS, UPSCALE_MODES } from '../constants';
import { UpscaleOption, UpscaleResolution, UpscaleMode } from '../types';

interface UpscaleControlsProps {
  selectedResolution: UpscaleResolution;
  selectedMode: UpscaleMode;
  onSelectResolution: (resolution: UpscaleResolution) => void;
  onSelectMode: (mode: UpscaleMode) => void;
  onUpscale: () => void;
  disabled: boolean;
  userCredits: number;
  queueSize: number;
}

const UpscaleControls: React.FC<UpscaleControlsProps> = ({ 
  selectedResolution, 
  selectedMode,
  onSelectResolution, 
  onSelectMode,
  onUpscale,
  disabled,
  userCredits,
  queueSize
}) => {
  const selectedOption = UPSCALE_OPTIONS.find(o => o.resolution === selectedResolution) || UPSCALE_OPTIONS[1];
  const totalCost = selectedOption.cost * (queueSize || 1);
  const canAfford = userCredits >= totalCost;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">Upscale Configuration</h3>
      
      {/* Resolution Selection */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Resolution</label>
        <div className="space-y-3">
          {UPSCALE_OPTIONS.map((option) => (
            <div
              key={option.resolution}
              onClick={() => !disabled && onSelectResolution(option.resolution)}
              className={`
                relative p-3 rounded-lg cursor-pointer border-2 transition-all duration-200
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
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${selectedResolution === option.resolution ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {option.cost} Credits
                </span>
              </div>
              <p className="text-[10px] text-slate-500">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6 flex-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Enhancement Mode</label>
        <div className="grid grid-cols-1 gap-2">
          {UPSCALE_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => !disabled && onSelectMode(mode.value as UpscaleMode)}
              className={`
                text-left px-3 py-2 rounded-md text-sm transition-colors border
                ${selectedMode === mode.value
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-slate-800">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-slate-400">Total Cost ({queueSize} images):</span>
          <span className={!canAfford ? 'text-red-400 font-bold' : 'text-white font-bold'}>
            {totalCost} Credits
          </span>
        </div>
        <div className="flex justify-between items-center mb-4 text-xs">
          <span className="text-slate-500">Balance:</span>
          <span className="text-slate-400">{userCredits} Credits</span>
        </div>
        
        <button
          onClick={onUpscale}
          disabled={disabled || !canAfford || queueSize === 0}
          className={`
            w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all
            ${disabled || !canAfford || queueSize === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-500/25'}
          `}
        >
          {queueSize === 0 ? 'Select Images' :
            !canAfford 
              ? `Need ${totalCost - userCredits} More` 
              : disabled 
                ? 'Processing...' 
                : 'Upscale All'}
        </button>
      </div>
    </div>
  );
};

export default UpscaleControls;
