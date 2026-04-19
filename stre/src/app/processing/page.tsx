"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoState } from '@/lib/demoState';
import { Loader2, CheckCircle2, Search } from 'lucide-react';

const ANALYSIS_STEPS = [
  "Parsing uploaded evidence...",
  "Estimating shelf density and SKU diversity...",
  "Mapping catchment and footfall signals...",
  "Checking competition context...",
  "Running fraud consistency checks...",
  "Calculating cashflow proxy bands...",
  "Generating underwriting summary..."
];

const INSIGHTS = [
  "High shelf density suggests strong inventory deployment.",
  "Exterior visibility improves geo confidence.",
  "Low competition increases revenue stability.",
  "Cross-referencing pincode density with visual proxy..."
];

export default function ProcessingPage() {
  const router = useRouter();
  const { inputs, setResult } = useDemoState();
  const [currentStep, setCurrentStep] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // Rotate insights
    const insightInterval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % INSIGHTS.length);
    }, 2500);

    // Progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200); // 1.2s per step

    // Smooth percentage counter
    const totalTime = ANALYSIS_STEPS.length * 1200 + 500;
    const startTime = Date.now();
    const percentInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calcPercent = Math.min(100, Math.round((elapsed / totalTime) * 100));
      setPercentage(calcPercent);
    }, 50);

    const callApiAndProceed = async () => {
      try {
        const formData = new FormData();
        
        const fetchBlob = async (url: string) => {
          const res = await fetch(url);
          return await res.blob();
        };

        if (inputs.interiorImage) {
          formData.append("images", await fetchBlob(inputs.interiorImage), "interior.jpg");
        }
        if (inputs.counterImage) {
          formData.append("images", await fetchBlob(inputs.counterImage), "counter.jpg");
        }
        if (inputs.exteriorImage) {
          formData.append("images", await fetchBlob(inputs.exteriorImage), "exterior.jpg");
        }

        const lat = 12.9716;
        const lon = 77.5946;
        formData.append("gps", JSON.stringify({ lat, lon }));
        formData.append("store_id", "demo-store");

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';
        const res = await fetch(`${baseUrl}/analyze-store`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("HTTP " + res.status + ": " + await res.text());
        }

        const data = await res.json();
        
        const confidenceScoreStr = String(data.confidence_score);
        const confScoreNum = confidenceScoreStr.includes('.') ? Math.round(data.confidence_score * 100) : data.confidence_score;
        
        const mappedFlags = (data.risk_flags || []).map((flagStr: string, idx: number) => {
          const parts = flagStr.split(':');
          const label = parts[0];
          const description = parts.length > 1 ? parts.slice(1).join(':').trim() : flagStr;
          const severity = (label.includes('HIGH_') || label.includes('MISMATCH') || label.includes('LOW_')) ? 'high' : 'medium';
          return {
            id: `F${idx + 1}`,
            label: label.replace(/_/g, ' '),
            severity: severity as 'high' | 'medium' | 'low',
            description: description
          };
        });

        const rec = confScoreNum >= 75 ? 'Pre-Approve' : (confScoreNum < 45 ? 'Reject' : 'Needs Verification');

        const result: any = {
          shelfDensity: Math.round((data.vision_signals?.shelf_density_index || 0) * 100),
          skuDiversity: Math.round((data.vision_signals?.sku_diversity || 0) * 100),
          inventoryValueScore: Math.round((data.vision_signals?.inventory_score || 0) * 100),
          refillSignal: 60,
          storeSizeProxy: 55,
          catchmentDensity: data.geo_signals?.poi_count ? Math.min(100, data.geo_signals.poi_count * 2) : 50,
          footfallProxy: data.geo_signals?.market_area_flag ? 80 : 50,
          competitionDensity: data.geo_signals?.competition_count ? Math.min(100, data.geo_signals.competition_count * 5) : 30,
          poiAccessScore: data.geo_signals?.restaurant_count ? Math.min(100, data.geo_signals.restaurant_count * 10) : 40,
          roadVisibilityScore: Math.round((data.geo_signals?.road_type_score || 0) * 100),
          evidenceCoverageScore: 100,
          confidenceScore: confScoreNum,
          
          dailySalesRange: [data.sales_range.low, data.sales_range.high],
          monthlyRevenueRange: [data.revenue_range.low, data.revenue_range.high],
          monthlyIncomeRange: [data.income_range.low, data.income_range.high],
          suggestedLoanBand: [Math.round(data.income_range.low * 3), Math.round(data.income_range.high * 5)],
          safeEmiRange: [Math.round(data.income_range.low * 0.2), Math.round(data.income_range.high * 0.4)],
          
          recommendation: rec,
          peerBenchmarkPercentile: Math.min(99, confScoreNum + Math.floor(Math.random() * 10)),
          fraudFlags: mappedFlags,
          explanationSummary: `Underwriting based on ${data.images_processed} image(s) and geo-context from ${data.geo_data_source}. ` + 
                              (mappedFlags.length === 0 ? "Strong consistent signals detected." : "Manual review required due to detected risk flags."),
          creditOfficerNotes: mappedFlags.length > 0 ? "Review anomalies." : "Clear case.",
          
          factorContributions: [
            { name: 'Shelf Density', score: Math.round((data.vision_signals?.shelf_density_index || 0) * 100) },
            { name: 'Location Proxy', score: data.geo_signals?.market_area_flag ? 80 : 50 },
            { name: 'SKU Diversity', score: Math.round((data.vision_signals?.sku_diversity || 0) * 100) },
            { name: 'Evidence Quality', score: 100 },
          ].sort((a, b) => b.score - a.score)
        };

        setResult(result);
        router.push('/results');
      } catch (err) {
        console.error("Analysis Failed", err);
        alert("API request failed. " + err);
        // fallback in case backend is down
        import('@/lib/mockEngine').then(({ runUnderwritingAnalysis }) => {
          setResult(runUnderwritingAnalysis(inputs));
          router.push('/results');
        });
      }
    };

    // Finish processing
    const finishTimeout = setTimeout(() => {
      callApiAndProceed();
    }, totalTime);

    return () => {
      clearInterval(insightInterval);
      clearInterval(stepInterval);
      clearInterval(percentInterval);
      clearTimeout(finishTimeout);
    };
  }, [inputs, router, setResult]);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        
        {/* Thumbnails Row */}
        <div className="flex justify-center gap-3 mb-6">
          {[inputs.interiorImage, inputs.counterImage, inputs.exteriorImage].map((src, idx) => (
            src ? (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm"
              >
                <img src={src} className="w-full h-full object-cover" alt="Evidence" />
              </motion.div>
            ) : null
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden">
          {/* Background decorative progress */}
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>

          <div className="text-center mb-10 mt-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mb-6 relative border-[6px] border-emerald-100">
              <span className="text-2xl font-black">{percentage}%</span>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                <Search className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Running Underwriting Analysis</h1>
            <p className="text-slate-500 text-sm font-medium">Evaluating visual evidence, geo signals, and business consistency.</p>
          </div>

          <div className="space-y-5 mb-10 pl-4 md:pl-8 border-l-2 border-slate-100">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-4 text-sm transition-all duration-500 relative ${
                    isCompleted ? 'text-slate-400' : isCurrent ? 'text-slate-900 font-bold scale-105 origin-left' : 'text-slate-300'
                  }`}
                >
                  <div className="absolute -left-[23px] md:-left-[39px] w-6 flex justify-center shrink-0 bg-white py-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    )}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-center items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Estimating confidence score...
            </div>
            <div className="h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={insightIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-semibold text-emerald-800"
                >
                  "{INSIGHTS[insightIndex]}"
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
