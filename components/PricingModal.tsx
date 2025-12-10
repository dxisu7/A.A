import React from 'react';
import { CreditPackage } from '../types';
import { CREDIT_PACKAGES } from '../constants';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (pkg: CreditPackage) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onPurchase }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Purchase Credits</h2>
          <p className="text-slate-400">Choose a package to start upscaling your images.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative border rounded-xl p-6 flex flex-col justify-between transition-transform hover:scale-105 ${
                pkg.featured 
                  ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{pkg.credits}</div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-6">Credits</div>
                
                <div className="text-2xl font-semibold text-emerald-400 mb-1">
                  ${pkg.price}
                </div>
                <div className="text-xs text-slate-500 mb-6">ex VAT</div>
              </div>

              <button
                onClick={() => onPurchase(pkg)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  pkg.featured
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-500">
          Secure payment processing. Credits never expire.
        </div>
      </div>
    </div>
  );
};

export default PricingModal;