import { Store } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-16">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-4 text-slate-800">
          <Store className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-xl">StoreCred AI</span>
        </div>
        <p className="text-slate-600 mb-6 font-medium">Remote underwriting for informal retail</p>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
          Estimate kirana cashflow using visual evidence, geo intelligence, and explainable underwriting logic.
        </p>
        <div className="text-xs text-slate-400">
          Prototype built for hackathon demonstration
        </div>
      </div>
    </footer>
  );
}
