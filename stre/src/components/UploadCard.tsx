"use client";

import React, { useRef, useState } from 'react';
import { UploadCloud, X, CheckCircle2, RefreshCcw, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadCardProps {
  title: string;
  description: string;
  value: string | null;
  onChange: (val: string | null) => void;
  required?: boolean;
}

export function UploadCard({ title, description, value, onChange, required }: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate file upload with object URL
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className={cn(
      "border-2 border-dashed rounded-2xl p-6 transition-all duration-300",
      value ? "border-emerald-500 bg-emerald-50/20 shadow-sm" : "border-slate-200 hover:border-emerald-400 hover:shadow-md bg-white group cursor-pointer"
    )}
      onClick={() => !value && fileInputRef.current?.click()}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            {title}
            {required && <span className="text-xs text-red-500 font-bold">*</span>}
          </h4>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        {value && <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Uploaded</div>}
      </div>

      {!value ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center mb-3 transition-colors">
            <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-600 transition-colors">Click or drag to upload</span>
          <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group/img rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video shadow-sm">
            <img src={value} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <div className="text-white text-xs font-medium flex items-center gap-2 truncate">
                <FileImage className="w-4 h-4 shrink-0" />
                <span className="truncate">{fileName || 'uploaded_image.jpg'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Replace
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onChange(null); setFileName(null); }}
              className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
