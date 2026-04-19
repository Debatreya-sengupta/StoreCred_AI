import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskFlag } from '@/lib/types';

export function RiskFlagChip({ flag }: { flag: RiskFlag }) {
  const isHigh = flag.severity === 'high';
  const isMedium = flag.severity === 'medium';
  const isLow = flag.severity === 'low';

  const Icon = isHigh ? AlertTriangle : isMedium ? AlertCircle : Info;

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-xl border",
      isHigh && "bg-red-50 border-red-100 text-red-900",
      isMedium && "bg-orange-50 border-orange-100 text-orange-900",
      isLow && "bg-blue-50 border-blue-100 text-blue-900",
    )}>
      <Icon className={cn(
        "w-5 h-5 shrink-0 mt-0.5",
        isHigh && "text-red-500",
        isMedium && "text-orange-500",
        isLow && "text-blue-500"
      )} />
      <div>
        <div className="font-semibold text-sm mb-0.5">{flag.label}</div>
        <div className={cn(
          "text-xs",
          isHigh && "text-red-700",
          isMedium && "text-orange-700",
          isLow && "text-blue-700"
        )}>{flag.description}</div>
      </div>
    </div>
  );
}
