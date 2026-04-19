import React from 'react';
import { cn } from '@/lib/utils';

export function ConfidenceGauge({ score }: { score: number }) {
  const isHigh = score >= 75;
  const isMedium = score >= 45 && score < 75;
  const isLow = score < 45;

  const color = isHigh ? 'text-emerald-500' : isMedium ? 'text-orange-500' : 'text-red-500';
  const bg = isHigh ? 'bg-emerald-500' : isMedium ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="relative w-32 h-16 overflow-hidden mb-2">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-slate-100"></div>
        <div 
          className={cn("absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-b-transparent border-r-transparent transition-transform duration-1000", color)}
          style={{ transform: `rotate(${ -135 + (score / 100) * 180 }deg)` }}
        ></div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900">{score}%</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Confidence Score</span>
      </div>
      <div className="mt-4 flex gap-2 w-full max-w-[200px]">
        <div className="flex-1 h-1.5 rounded-full bg-red-100 overflow-hidden">
          {isLow && <div className={cn("h-full w-full", bg)} />}
        </div>
        <div className="flex-1 h-1.5 rounded-full bg-orange-100 overflow-hidden">
          {isMedium && <div className={cn("h-full w-full", bg)} />}
        </div>
        <div className="flex-1 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
          {isHigh && <div className={cn("h-full w-full", bg)} />}
        </div>
      </div>
    </div>
  );
}
