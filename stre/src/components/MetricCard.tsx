import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ title, value, subtitle, className, icon, trend }: MetricCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl shadow-sm border border-slate-100", className)}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        {trend && (
          <span className={cn(
            "text-xs font-semibold mb-1",
            trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-red-500" : "text-slate-500"
          )}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '-'}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
}
