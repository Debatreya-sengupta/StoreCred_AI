"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoState } from '@/lib/demoState';
import { ArrowLeft, Download, Store, AlertCircle, CheckCircle2, ShieldAlert, X, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function UnderwriterPage() {
  const router = useRouter();
  const { result, inputs, decisionStatus, setDecisionStatus } = useDemoState();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showVerificationDrawer, setShowVerificationDrawer] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No Case Data</h2>
        <p className="mb-8">Please run an assessment first to populate the underwriter console.</p>
        <button onClick={() => router.push('/assess')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium">Go to Assessment</button>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleAction = (status: 'approved' | 'field_verification' | 'rejected') => {
    setDecisionStatus(status);
    if (status === 'approved') {
      setShowApproveModal(true);
      setToast({ message: "Loan Approved Successfully", type: 'success' });
    } else if (status === 'field_verification') {
      setShowVerificationDrawer(true);
      setToast({ message: "Case sent for field verification", type: 'warning' });
    } else {
      setShowRejectModal(true);
      setToast({ message: "Case Rejected", type: 'error' });
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ caseId: '1042-KS', inputs, result, decisionStatus }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StoreCred_Case_1042_${decisionStatus}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const badgeText = decisionStatus === 'pending' 
    ? result.recommendation 
    : decisionStatus === 'approved' 
    ? 'APPROVED' 
    : decisionStatus === 'field_verification' 
    ? 'VERIFICATION REQUIRED' 
    : 'REJECTED';

  const badgeStyle = decisionStatus === 'pending'
    ? (result.recommendation === 'Pre-Approve' ? 'bg-emerald-500/20 text-emerald-400' :
       result.recommendation === 'Reject' ? 'bg-red-500/20 text-red-400' :
       'bg-amber-500/20 text-amber-400')
    : decisionStatus === 'approved'
    ? 'bg-emerald-500/20 text-emerald-400'
    : decisionStatus === 'field_verification'
    ? 'bg-amber-500/20 text-amber-400'
    : 'bg-red-500/20 text-red-400';

  return (
    <div className="bg-slate-100 min-h-screen pb-24 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border",
            toast.type === 'success' && "bg-white border-emerald-200 text-emerald-800",
            toast.type === 'warning' && "bg-white border-amber-200 text-amber-800",
            toast.type === 'error' && "bg-white border-red-200 text-red-800"
          )}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
             toast.type === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-500" /> :
             <ShieldAlert className="w-5 h-5 text-red-500" />}
            <span className="font-semibold text-sm">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Console Bar */}
      <div className="bg-slate-900 text-white sticky top-16 z-40 border-t border-slate-800">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/results')} className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-700" />
            <h1 className="font-bold tracking-wide flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-500" /> CASE #1042-KS
            </h1>
            <div className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeStyle}`}>
              {badgeText}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportJSON} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition">
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Case Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">System Confidence</div>
            <div className="text-2xl font-black text-slate-900">{result.confidenceScore}%</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Evidence Coverage</div>
            <div className="text-2xl font-black text-slate-900">{result.evidenceCoverageScore}%</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Est. Monthly Income</div>
            <div className="text-xl font-bold text-emerald-600">{formatCurrency(result.monthlyIncomeRange[0])}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Safe EMI Range</div>
            <div className="text-xl font-bold text-slate-900">{formatCurrency(result.safeEmiRange[1])} max</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Risk Flags</div>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
              {result.fraudFlags.length} 
              {result.fraudFlags.length > 0 && <ShieldAlert className="w-5 h-5 text-red-500" />}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200">
            {['overview', 'evidence', 'logic', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/30' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Business Profile</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500">Pincode:</dt> <dd className="font-medium text-slate-900">{inputs.locationPincode || 'N/A'}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Shop Size:</dt> <dd className="font-medium text-slate-900">{inputs.shopSizeSqFt ? `${inputs.shopSizeSqFt} sq ft` : 'Unspecified'}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Store Type:</dt> <dd className="font-medium text-slate-900 capitalize">{inputs.storeType}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500">Years in Op:</dt> <dd className="font-medium text-slate-900">{inputs.yearsInOperation || 'Unspecified'}</dd></div>
                  </dl>

                  {decisionStatus !== 'pending' && (
                    <div className="mb-8 mt-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Next Step Action</h3>
                      <div className={cn(
                        "p-4 rounded-xl border flex items-center gap-3",
                        decisionStatus === 'approved' ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
                        decisionStatus === 'field_verification' ? "bg-amber-50 border-amber-200 text-amber-900" :
                        "bg-red-50 border-red-200 text-red-900"
                      )}>
                        {decisionStatus === 'approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                         decisionStatus === 'field_verification' ? <Clock className="w-5 h-5 text-amber-600" /> :
                         <X className="w-5 h-5 text-red-600" />}
                        <span className="font-medium">
                          {decisionStatus === 'approved' ? "Proceed to disbursal workflow" :
                           decisionStatus === 'field_verification' ? "Await field agent report" :
                           "Case archived for review"}
                        </span>
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900 mb-4 mt-8 border-b pb-2">Underwriting Summary</h3>
                  <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.explanationSummary}
                  </p>

                  <h3 className="text-lg font-bold text-slate-900 mb-4 mt-8 border-b pb-2">Decision History</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">System Recommendation</div>
                        <div className="text-xs text-slate-500">{result.recommendation}</div>
                      </div>
                    </div>
                    {decisionStatus !== 'pending' && (
                      <div className="flex items-start gap-3 relative">
                        <div className="absolute left-1 -top-3 w-px h-4 bg-slate-200" />
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0 z-10",
                          decisionStatus === 'approved' ? "bg-emerald-500" :
                          decisionStatus === 'field_verification' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Final Decision</div>
                          <div className="text-xs text-slate-500">
                            {decisionStatus === 'approved' ? 'Approved by Underwriter' :
                             decisionStatus === 'field_verification' ? 'Sent for Verification by Underwriter' :
                             'Rejected by Underwriter'}
                          </div>
                          {result.recommendation === 'Pre-Approve' && decisionStatus !== 'approved' && (
                            <div className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-300 pl-2">
                              Reason: Manual override. Evidence required further scrutiny or rejected based on offline policy.
                            </div>
                          )}
                          {result.recommendation === 'Reject' && decisionStatus !== 'rejected' && (
                            <div className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-300 pl-2">
                              Reason: Manual override. Exception approved by senior underwriter.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Key Factor Strengths</h3>
                  <div className="space-y-4">
                    {result.factorContributions.slice(0, 3).map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">{factor.score}</div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{factor.name}</div>
                          <div className="text-xs text-slate-500">Positive signal impact</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.fraudFlags.length > 0 && (
                    <>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 mt-8 border-b pb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" /> Detected Risks
                      </h3>
                      <div className="space-y-3">
                        {result.fraudFlags.map((flag) => (
                          <div key={flag.id} className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-3 text-sm">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-red-900">{flag.label}</div>
                              <div className="text-red-700 mt-0.5 text-xs">{flag.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Tab */}
            {activeTab === 'evidence' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Uploaded Media</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { title: 'Interior Shelf', src: inputs.interiorImage },
                    { title: 'Counter Area', src: inputs.counterImage },
                    { title: 'Exterior Storefront', src: inputs.exteriorImage },
                  ].map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <div className="aspect-video bg-slate-200 relative">
                        {item.src ? (
                          <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 text-sm">Missing Evidence</div>
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-200">
                        <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          {item.src ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Extracted Successfully</> : <><AlertCircle className="w-3 h-3 text-red-500" /> Required for full confidence</>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logic Tab */}
            {activeTab === 'logic' && (
              <div className="space-y-8">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Visual Intelligence Logic</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-sm text-slate-800 mb-1">Shelf Density Score</h4>
                       <p className="text-xs text-slate-600">Measures the utilization of visible shelf space. High density correlates strongly with consistent inventory investment and working capital strength.</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-sm text-slate-800 mb-1">SKU Diversity Proxy</h4>
                       <p className="text-xs text-slate-600">Analyzes the variety of distinct product categories. Wide variety indicates multiple vendor relationships and resilience against single-product demand drops.</p>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Geo Intelligence Logic</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-sm text-slate-800 mb-1">Location Footfall Proxy</h4>
                       <p className="text-xs text-slate-600">Derived from pincode density and exterior contextual indicators (e.g. street type, nearby PoIs). Strongly dictates the potential customer flow.</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="font-bold text-sm text-slate-800 mb-1">Competition Density</h4>
                       <p className="text-xs text-slate-600">Assesses the saturation of similar businesses in the catchment. High competition negatively impacts margins and revenue predictability.</p>
                     </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Fraud Detection Logic</h3>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <h4 className="font-bold text-sm text-slate-800 mb-2">Cross-Signal Contradiction Checks</h4>
                     <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
                       <li><strong>Inventory-Footfall Mismatch:</strong> If interior inventory suggests massive scale but the exterior location proxy indicates dead-end low footfall, it flags as potential "staged stocking".</li>
                       <li><strong>Missing Evidence Penalty:</strong> Absolute requirement for storefront contextual images. Failure to provide results in an automatic system rejection.</li>
                     </ul>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2 mt-8">Raw Rule Evaluation Log</h3>
                   <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-x-auto text-emerald-400 shadow-inner">
                      <div className="text-slate-400 mb-2">// Executing StoreCred Assessment Rules engine...</div>
                      <div>[EVAL] Evidence Coverage = {result.evidenceCoverageScore}/100</div>
                      <div>[EVAL] Visual Proxy Model: Shelf Density={result.shelfDensity}, SKU Diversity={result.skuDiversity}</div>
                      <div>[EVAL] Geo-Spatial Context: Catchment={result.catchmentDensity}, Footfall Proxy={result.footfallProxy}</div>
                      <div className="text-slate-400 mt-2">// Running contradiction checks...</div>
                      {result.fraudFlags.length === 0 ? (
                        <div>[PASS] No logical contradictions detected between inventory and footfall proxies.</div>
                      ) : (
                        result.fraudFlags.map(f => (
                          <div key={f.id} className="text-red-400">[WARN] RULE_FAIL: {f.label} - {f.description}</div>
                        ))
                      )}
                      <div className="text-slate-400 mt-2">// Aggregating final confidence bounds...</div>
                      <div>[CALC] Final Confidence Score = {result.confidenceScore}%</div>
                      <div className="text-white mt-2 font-bold">[RESULT] Recommendation = {result.recommendation}</div>
                   </div>
                 </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Credit Officer Notes</h3>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-sm font-medium mb-6">
                  {result.creditOfficerNotes}
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Add Manual Verification Note</label>
                  <textarea 
                    rows={4} 
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter observations or requirements for field agent..."
                  ></textarea>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Save Note</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Decision Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
          <div className="text-slate-900 font-bold flex items-center gap-3">
            Final Decision Action
            {decisionStatus !== 'pending' && <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Final decision recorded by underwriter</span>}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handleAction('rejected')}
              disabled={decisionStatus !== 'pending'}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold transition",
                decisionStatus === 'rejected' ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2 opacity-100' : 'bg-red-50 text-red-700 hover:bg-red-100',
                decisionStatus !== 'pending' && decisionStatus !== 'rejected' && 'opacity-40 grayscale cursor-not-allowed'
              )}
            >
              Reject Case
            </button>
            <button 
              onClick={() => handleAction('field_verification')}
              disabled={decisionStatus !== 'pending'}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold transition",
                decisionStatus === 'field_verification' ? 'bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2 opacity-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                decisionStatus !== 'pending' && decisionStatus !== 'field_verification' && 'opacity-40 grayscale cursor-not-allowed'
              )}
            >
              Send to Field Agent
            </button>
            <button 
              onClick={() => handleAction('approved')}
              disabled={decisionStatus !== 'pending'}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold transition shadow-sm",
                decisionStatus === 'approved' ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2 opacity-100' : 'bg-emerald-600 text-white hover:bg-emerald-700',
                decisionStatus !== 'pending' && decisionStatus !== 'approved' && 'opacity-40 grayscale cursor-not-allowed'
              )}
            >
              Approve Loan
            </button>
          </div>
        </div>
      </div>
      
      {/* Post-Decision Modals & Drawers */}
      <AnimatePresence>
        {/* Approve Loan Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-emerald-500 p-8 text-center text-white relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.1 }}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 shadow-xl relative z-10"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <h2 className="text-3xl font-extrabold relative z-10">Loan Approved</h2>
              </div>
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Approved Band</span>
                    <span className="font-bold text-slate-900 text-lg">{formatCurrency(result.suggestedLoanBand[0])} - {formatCurrency(result.suggestedLoanBand[1])}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Safe EMI Range</span>
                    <span className="font-bold text-slate-900 text-lg">Up to {formatCurrency(result.safeEmiRange[1])}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium">Confidence Score</span>
                    <span className="font-bold text-emerald-600 text-lg">{result.confidenceScore}%</span>
                  </div>
                </div>

                <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Key Approval Reasons:</h4>
                  <ul className="space-y-3 text-sm font-medium text-slate-700">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Strong inventory signals</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> High evidence quality</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> No fraud contradictions</li>
                  </ul>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl text-sm font-medium text-emerald-800 text-center mb-8 border border-emerald-100">
                  This case has been moved to disbursal review.
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowApproveModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">Close</button>
                  <button onClick={() => { setShowApproveModal(false); setActiveTab('overview'); }} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition">View Summary</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reject Case Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600 shadow-sm border border-red-200">
                  <X className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Case Rejected</h2>
                <p className="text-slate-500 font-medium mb-8">This application has been declined based on system and underwriter assessment.</p>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Primary Reasons:</h4>
                  <ul className="space-y-3 text-sm font-medium text-slate-700 bg-red-50/50 p-5 rounded-2xl border border-red-50">
                    <li className="flex items-start gap-3"><ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" /> Weak or missing evidence</li>
                    <li className="flex items-start gap-3"><ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" /> Low system confidence ({result.confidenceScore}%)</li>
                    {result.fraudFlags.length > 0 && (
                      <li className="flex items-start gap-3"><ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" /> {result.fraudFlags.length} Risk flags detected</li>
                    )}
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800 mb-8 font-medium">
                  <span className="font-bold block mb-1">Suggestion:</span> Case can be re-evaluated with stronger supporting evidence.
                </div>

                <button onClick={() => setShowRejectModal(false)} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-lg">Acknowledge</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Field Verification Side Drawer */}
        {showVerificationDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowVerificationDrawer(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-500 text-white">
                <h2 className="text-xl font-bold">Field Verification Initiated</h2>
                <button onClick={() => setShowVerificationDrawer(false)} className="text-white/80 hover:text-white transition"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-500 text-sm font-medium">Request ID</span>
                    <span className="font-black text-slate-900">FV-2048</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-500 text-sm font-medium">Status</span>
                    <span className="font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Assigned</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm font-medium">Estimated Time</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> 24 hours</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Verification Checklist:</h4>
                  <div className="space-y-3">
                    {['Storefront validation', 'Business proof confirmation', 'Live inventory validation', 'Location & geo verification'].map((item, idx) => (
                      <label key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-not-allowed">
                        <input type="checkbox" className="mt-0.5 w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" disabled />
                        <span className="text-sm font-semibold text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl text-sm text-amber-800 font-medium border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p>Case routed for manual verification due to incomplete or uncertain signals in the initial proxy assessment.</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button onClick={() => setShowVerificationDrawer(false)} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-lg">
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
