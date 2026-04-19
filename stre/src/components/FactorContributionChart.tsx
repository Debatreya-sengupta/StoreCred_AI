"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { FactorContribution } from '@/lib/types';

export function FactorContributionChart({ data }: { data: FactorContribution[] }) {
  // Sort descending for better chart display
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="h-80 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 50, left: 40, bottom: 5 }}>
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} 
            width={140}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            formatter={(val: number) => [`${val}%`, 'Contribution']}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
            <LabelList 
              dataKey="score" 
              position="right" 
              formatter={(val: number) => `${val}%`}
              style={{ fill: '#0f172a', fontWeight: 700, fontSize: 13 }}
            />
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index < 2 ? '#059669' : '#94a3b8'} // Highlight top 2 drivers
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
