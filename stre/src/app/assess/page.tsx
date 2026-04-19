"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoState } from '@/lib/demoState';
import { UploadCard } from '@/components/UploadCard';
import { calculateEvidenceCoverage } from '@/lib/scoring';
import { CheckCircle2, ChevronRight, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssessPage() {
  const router = useRouter();
  const { inputs, setInputs } = useDemoState();
  const [coverage, setCoverage] = useState(0);

  useEffect(() => {
    setCoverage(calculateEvidenceCoverage(inputs));
  }, [inputs]);

  const handleRunAssessment = () => {
    if (!inputs.interiorImage || !inputs.counterImage || !inputs.exteriorImage || !inputs.locationPincode) {
      alert("Please provide all required evidence (3 images + pincode) to run the assessment.");
      return;
    }
    router.push('/processing');
  };

  const coverageColor = coverage >= 80 ? 'text-emerald-500 bg-emerald-500' : coverage >= 50 ? 'text-amber-500 bg-amber-500' : 'text-red-500 bg-red-500';

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assess a Kirana Store</h1>
          <p className="text-slate-600 mt-3 text-lg">Upload store evidence and business context to generate a remote underwriting assessment.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Required Evidence */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="bg-slate-900 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center font-bold">1</span>
                Required Evidence
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <UploadCard 
                  title="Interior Shelf" 
                  description="Shows inventory density & SKU variety"
                  required
                  value={inputs.interiorImage}
                  onChange={(val) => setInputs({ ...inputs, interiorImage: val })}
                />
                <UploadCard 
                  title="Counter Area" 
                  description="Shows checkout flow & fast-moving items"
                  required
                  value={inputs.counterImage}
                  onChange={(val) => setInputs({ ...inputs, counterImage: val })}
                />
                <UploadCard 
                  title="Storefront Exterior" 
                  description="Shows exterior context & visibility"
                  required
                  value={inputs.exteriorImage}
                  onChange={(val) => setInputs({ ...inputs, exteriorImage: val })}
                />
                <div className="space-y-2 flex flex-col justify-end pb-1">
                  <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    Location Pincode <span className="text-xs text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-3.5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition outline-none font-bold placeholder:font-medium placeholder:text-slate-400"
                      placeholder="e.g. 400001"
                      value={inputs.locationPincode}
                      onChange={(e) => setInputs({ ...inputs, locationPincode: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Used for geo-intelligence signals.</p>
                </div>
              </div>
            </div>

            {/* Optional Business Metadata */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="bg-slate-900 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center font-bold">2</span>
                Optional Metadata
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 text-sm">Shop Size (sq ft)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition outline-none font-bold placeholder:font-medium placeholder:text-slate-400"
                    placeholder="e.g. 150"
                    value={inputs.shopSizeSqFt}
                    onChange={(e) => setInputs({ ...inputs, shopSizeSqFt: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 text-sm">Monthly Rent (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition outline-none font-bold placeholder:font-medium placeholder:text-slate-400"
                    placeholder="e.g. 15000"
                    value={inputs.monthlyRent}
                    onChange={(e) => setInputs({ ...inputs, monthlyRent: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 text-sm">Years in Operation</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition outline-none font-bold placeholder:font-medium placeholder:text-slate-400"
                    placeholder="e.g. 5"
                    value={inputs.yearsInOperation}
                    onChange={(e) => setInputs({ ...inputs, yearsInOperation: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 text-sm">Store Type</label>
                  <select 
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-xl p-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition outline-none font-bold appearance-none"
                    value={inputs.storeType}
                    onChange={(e) => setInputs({ ...inputs, storeType: e.target.value })}
                  >
                    <option value="general">General Kirana</option>
                    <option value="fmcg">FMCG Focused</option>
                    <option value="dairy">Dairy / Fresh</option>
                    <option value="medical">Medical / Pharmacy</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Info */}
          <div className="space-y-6 sticky top-24">
            
            {/* Coverage Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Evidence Completeness
              </h3>
              
              <div className="flex items-end justify-between mb-2 mt-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Quality Score</span>
                <span className={cn("text-2xl font-black", coverageColor.split(' ')[0])}>{coverage}%</span>
              </div>
              
              <div className="mb-6 relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn("absolute top-0 left-0 h-full transition-all duration-700", coverageColor.split(' ')[1])}
                  style={{ width: `${coverage}%` }}
                ></div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                {[
                  { label: 'Interior Image', done: !!inputs.interiorImage },
                  { label: 'Counter Image', done: !!inputs.counterImage },
                  { label: 'Storefront Image', done: !!inputs.exteriorImage },
                  { label: 'Location Pincode', done: !!inputs.locationPincode },
                  { label: 'Business Metadata', done: !!inputs.shopSizeSqFt || !!inputs.monthlyRent },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                      item.done ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-300"
                    )}>
                      {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    </div>
                    <span className={cn("text-sm font-medium", item.done ? "text-slate-900" : "text-slate-400")}>{item.label}</span>
                  </div>
                ))}
              </div>
              
              {coverage < 80 && (
                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Higher evidence coverage produces more confident proxy signals and reduces risk flags.
                  </p>
                </div>
              )}
            </div>

            {/* What we analyze */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-sm text-white">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Underwriting Analysis
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                The submitted evidence will be analyzed across multiple dimensions:
              </p>
              <ul className="text-sm text-slate-300 space-y-3 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Shelf Density Index
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> SKU Diversity
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Footfall Proxy
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Fraud Consistency Checks
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="text-sm font-semibold text-slate-500">
            {coverage < 80 ? 'Add more evidence for higher confidence' : 'Ready to analyze'}
          </div>
          <button 
            onClick={handleRunAssessment}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            Run AI Assessment
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
