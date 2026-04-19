import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

export function ProgressStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="relative flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 z-10 bg-white",
              step.isComplete ? "border-emerald-500 bg-emerald-50 text-emerald-500" : 
              step.isActive ? "border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-400"
            )}>
              {step.isComplete ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">{idx + 1}</span>}
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "absolute top-8 w-0.5 h-6 transition-colors duration-500",
                step.isComplete ? "bg-emerald-500" : "bg-slate-200"
              )} />
            )}
          </div>
          <div className={cn(
            "text-sm font-medium transition-colors duration-500",
            step.isComplete ? "text-slate-800" :
            step.isActive ? "text-slate-900 font-bold" : "text-slate-400"
          )}>
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}
