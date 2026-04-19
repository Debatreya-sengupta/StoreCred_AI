"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoState } from '@/lib/demoState';
import { MetricCard } from '@/components/MetricCard';
import { FactorContributionChart } from '@/components/FactorContributionChart';
import { CheckCircle2, AlertTriangle, ShieldAlert, FileText, Share, SlidersHorizontal, RefreshCw, ShieldCheck, FileCheck2, Camera, MapPin, TrendingUp, Info, HelpCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const router = useRouter();
  const { result, inputs, reset, decisionStatus } = useDemoState();
  const [simValues, setSimValues] = useState({
    inventory: 50,
    footfall: 50,
  });

  const handleExportSummary = () => {
    const dataStr = JSON.stringify({ caseId: '1042-KS', inputs, result, decisionStatus }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StoreCred_Summary_1042_${decisionStatus !== 'pending' ? decisionStatus : 'system_assessed'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No Assessment Data</h2>
        <p className="mb-8">Please run an assessment first.</p>
        <button onClick={() => { reset(); router.push('/assess'); }} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium">Go to Assessment</button>
      </div>
    );
  }

  // Simulator adjustments
  const adjInv = (simValues.inventory - 50) / 100;
  const adjFoot = (simValues.footfall - 50) / 100;
  const simRev = [
    Math.round(result.monthlyRevenueRange[0] * (1 + adjInv * 0.2 + adjFoot * 0.15)),
    Math.round(result.monthlyRevenueRange[1] * (1 + adjInv * 0.2 + adjFoot * 0.15))
  ];
  
  // Calculate simulated confidence and recommendation
  const simConfAdj = Math.round((adjInv + adjFoot) * 20);
  const simConf = Math.min(100, Math.max(0, result.confidenceScore + simConfAdj));
  const simRec = simConf >= 80 ? 'Pre-Approve' : simConf >= 60 ? 'Needs Verification' : 'Reject';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const finalRecommendation = decisionStatus !== 'pending' 
    ? (decisionStatus === 'approved' ? 'APPROVED' : decisionStatus === 'field_verification' ? 'VERIFICATION REQ' : 'REJECTED')
    : result.recommendation;

  const isPreApprove = decisionStatus !== 'pending' ? decisionStatus === 'approved' : result.recommendation === 'Pre-Approve';
  const isNeedsVerification = decisionStatus !== 'pending' ? decisionStatus === 'field_verification' : result.recommendation === 'Needs Verification';

  const fraudRiskLevel = result.fraudFlags.some(f => f.severity === 'high') ? 'HIGH' : result.fraudFlags.length > 0 ? 'MEDIUM' : 'LOW';

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessment Results</h1>
            <p className="text-slate-500 font-medium">Proxy-based underwriting summary for submitted kirana evidence</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { reset(); router.push('/assess'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 shadow-sm transition text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Re-run
            </button>
            <button 
              onClick={handleExportSummary}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 shadow-sm transition text-sm"
            >
              <Share className="w-4 h-4" /> Export Summary
            </button>
            <Link 
              href="/underwriter"
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-800 shadow-sm transition text-sm"
            >
              Open Underwriter View
            </Link>
          </div>
        </div>

        <div className="space-y-12">
          
          {/* 1. Recommendation Banner */}
          <section>
            <div className={`rounded-3xl p-8 border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 ${
              isPreApprove ? 'bg-emerald-50 border-emerald-200' : 
              isNeedsVerification ? 'bg-amber-50 border-amber-200' : 
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  isPreApprove ? 'bg-emerald-500 text-white' : 
                  isNeedsVerification ? 'bg-amber-500 text-white' : 
                  'bg-red-500 text-white'
                }`}>
                  {isPreApprove ? <CheckCircle2 className="w-8 h-8" /> : 
                   isNeedsVerification ? <AlertTriangle className="w-8 h-8" /> : 
                   <ShieldAlert className="w-8 h-8" />}
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: isPreApprove ? '#059669' : isNeedsVerification ? '#d97706' : '#dc2626' }}>
                    {decisionStatus !== 'pending' ? 'Final Decision' : 'System Recommendation'}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{finalRecommendation}</h2>
                  <p className="text-sm font-medium mt-1" style={{ color: isPreApprove ? '#047857' : isNeedsVerification ? '#b45309' : '#b91c1c' }}>
                    {isPreApprove ? 'Strong proxy signals align with low-risk profile.' : 
                     isNeedsVerification ? 'Moderate confidence. Requires manual verification of flagged items.' : 
                     'High contradiction or missing evidence. Automated rejection.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-8 text-center shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <div className="text-3xl font-black text-slate-900">{result.confidenceScore}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confidence</div>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{result.evidenceCoverageScore}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Coverage</div>
                </div>
              </div>
            </div>

            {/* Why This Case is Approved / Rejected */}
            <div className="mt-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-slate-400" />
                Why This Case {isPreApprove ? 'is Approved' : isNeedsVerification ? 'Needs Verification' : 'was Rejected'}
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm font-medium text-slate-700">
                {isPreApprove ? (
                  <>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> High evidence quality score ({result.evidenceCoverageScore}%)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strong inventory presence detected</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Good catchment density proxy</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No fraud contradictions</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Balanced SKU diversity</li>
                  </>
                ) : isNeedsVerification ? (
                  <>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Moderate evidence coverage ({result.evidenceCoverageScore}%)</li>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Signal mismatch detected in proxies</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Baseline inventory value is acceptable</li>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Manual review of anomalies required</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> Low evidence coverage ({result.evidenceCoverageScore}%)</li>
                    <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> High severity fraud contradictions</li>
                    <li className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> Unverifiable visual inventory</li>
                    <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Automatic policy rejection</li>
                  </>
                )}
              </ul>
            </div>

            {/* Next Step Summary Block */}
            {decisionStatus !== 'pending' && (
              <div className="mt-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                  decisionStatus === 'approved' ? "bg-emerald-100 text-emerald-600" :
                  decisionStatus === 'field_verification' ? "bg-amber-100 text-amber-600" :
                  "bg-red-100 text-red-600"
                )}>
                  {decisionStatus === 'approved' ? <CheckCircle2 className="w-6 h-6" /> :
                   decisionStatus === 'field_verification' ? <Clock className="w-6 h-6" /> :
                   <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Next Step Action</h3>
                  <p className="text-slate-600 font-medium">
                    {decisionStatus === 'approved' ? "Proceed to disbursal workflow." :
                     decisionStatus === 'field_verification' ? "Await field agent report." :
                     "Case archived for review."}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 2. Key Financial Metrics */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Estimated Cashflow Proxies</h2>
            <div className="grid md:grid-cols-4 gap-4 items-stretch">
              <MetricCard title="Est. Daily Sales" value={`${formatCurrency(result.dailySalesRange[0])} - ${formatCurrency(result.dailySalesRange[1])}`} />
              <MetricCard title="Est. Monthly Revenue" value={`${formatCurrency(result.monthlyRevenueRange[0])} - ${formatCurrency(result.monthlyRevenueRange[1])}`} />
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Est. Monthly Income (15%)</div>
                <div className="text-2xl font-black text-slate-900 mb-2">{formatCurrency(result.monthlyIncomeRange[0])} - {formatCurrency(result.monthlyIncomeRange[1])}</div>
                <div className="text-xs text-slate-400 font-medium leading-snug">Estimated using inventory turnover and location demand proxies.</div>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-center">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Suggested Loan Band</p>
                <h4 className="text-2xl font-black mb-2">{formatCurrency(result.suggestedLoanBand[0])} - {formatCurrency(result.suggestedLoanBand[1])}</h4>
                <div className="text-xs text-slate-400 font-medium leading-snug">Derived from income range, confidence score, and EMI safety threshold (~35%).</div>
              </div>
            </div>
          </section>

          {/* 3. Executive Summary */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" /> Executive Underwriting Summary
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed font-medium">
              {result.explanationSummary}
            </p>
          </section>

          {/* 4. Fraud & Risk Analysis */}
          <section className="bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-800 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b border-slate-700 pb-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <ShieldCheck className="w-7 h-7 text-emerald-400" /> Fraud & Consistency Checks
                    </h2>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      fraudRiskLevel === 'LOW' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                      fraudRiskLevel === 'MEDIUM' ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : 
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    )}>
                      RISK: {fraudRiskLevel}
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium">
                    {result.fraudFlags.length === 0 
                      ? "Cross-signal consistency is strong, reducing the likelihood of manipulated evidence." 
                      : "Contradictions detected between visual and geo-spatial proxies require manual review."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">{result.evidenceCoverageScore}/100</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Evidence Quality Score</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Signal Validations</h3>
                  <div className="space-y-4">
                    <ValidationRow label="Visual-Geo Consistency" valid={!result.fraudFlags.some(f => f.id === 'F2')} />
                    <ValidationRow label="Inventory vs Footfall Match" valid={!result.fraudFlags.some(f => f.id === 'F2')} />
                    <ValidationRow label="Exterior Context Validity" valid={!result.fraudFlags.some(f => f.id === 'F3')} />
                    <ValidationRow label="Evidence Completeness" valid={!result.fraudFlags.some(f => f.id === 'F1')} />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detected Risk Flags</h3>
                  <div className="space-y-3">
                    {result.fraudFlags.length > 0 ? (
                      result.fraudFlags.map((flag) => (
                        <div key={flag.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-start gap-3">
                          <ShieldAlert className={cn("w-5 h-5 shrink-0 mt-0.5", flag.severity === 'high' ? 'text-red-400' : 'text-amber-400')} />
                          <div>
                            <div className={cn("font-bold text-sm", flag.severity === 'high' ? 'text-red-300' : 'text-amber-300')}>{flag.label}</div>
                            <div className="text-slate-400 mt-1 text-xs">{flag.description}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-100 font-medium text-sm">No major contradictions detected across data modalities.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Analytics Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* 5. Visual Intelligence */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" /> Visual Intelligence
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <MiniScore label="Shelf Density Index" score={result.shelfDensity} />
                  <MiniScore label="SKU Diversity Score" score={result.skuDiversity} />
                  <MiniScore label="Inventory Value Proxy" score={result.inventoryValueScore} />
                  <MiniScore label="Refill Signal" score={result.refillSignal} />
                </div>
              </section>

              {/* 6. Geo Intelligence */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" /> Geo Intelligence
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <MiniScore label="Footfall Proxy" score={result.footfallProxy} />
                  <MiniScore label="Catchment Density" score={result.catchmentDensity} />
                  <MiniScore label="Competition Density" score={result.competitionDensity} invertColor />
                  <MiniScore label="POI Access Score" score={result.poiAccessScore} />
                </div>
              </section>

              {/* Manual Verification Info */}
              <section className="bg-amber-50 rounded-3xl shadow-sm border border-amber-200 p-8">
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> When is Manual Verification Required?
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm font-medium text-amber-800">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Low evidence coverage (&lt;60%)</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Missing storefront image</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Visual-geo mismatch</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> High competition uncertainty</li>
                </ul>
              </section>

            </div>

            <div className="space-y-8">
              {/* 7. Confidence Drivers */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" /> Confidence Drivers
                </h2>
                <ul className="space-y-4">
                  <ConfidenceDriver label="Storefront evidence provided" valid={!result.fraudFlags.some(f => f.id === 'F3')} />
                  <ConfidenceDriver label="High evidence quality score" valid={result.evidenceCoverageScore >= 70} />
                  <ConfidenceDriver label="Strong visual-geo consistency" valid={!result.fraudFlags.some(f => f.id === 'F2')} />
                  {result.competitionDensity > 40 ? (
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
                      <span className="text-sm font-medium text-slate-700 leading-snug">Moderate competition slightly reduces confidence</span>
                    </li>
                  ) : (
                    <ConfidenceDriver label="Favorable competition density" valid={true} />
                  )}
                </ul>
              </section>

              {/* 8. Factor Contribution Chart */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" /> Factor Contribution
                </h2>
                <p className="text-sm text-slate-500 font-medium mb-6">Primary signals driving this decision</p>
                <FactorContributionChart data={result.factorContributions} />
              </section>

              {/* 9. Scenario Simulator */}
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" /> What-if Scenario Simulator
                </h2>
                <p className="text-sm text-slate-500 font-medium mb-6">Adjust store conditions to simulate impact on revenue and underwriting decision.</p>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-700 mb-3">
                      <span>Inventory Density</span>
                      <span>{simValues.inventory}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={simValues.inventory} 
                      onChange={e => setSimValues({...simValues, inventory: Number(e.target.value)})}
                      className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-700 mb-3">
                      <span>Location Footfall</span>
                      <span>{simValues.footfall}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={simValues.footfall} 
                      onChange={e => setSimValues({...simValues, footfall: Number(e.target.value)})}
                      className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Simulated Monthly Revenue</div>
                    <div className="text-2xl font-black text-slate-900">
                      {formatCurrency(simRev[0])} - {formatCurrency(simRev[1])}
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sim. Confidence</div>
                      <div className="text-lg font-black text-slate-900">{simConf}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sim. Decision</div>
                      <div className={cn("text-sm font-bold", simRec === 'Pre-Approve' ? 'text-emerald-600' : simRec === 'Needs Verification' ? 'text-amber-600' : 'text-red-600')}>{simRec}</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            This assessment is based on proxy signals and should be combined with manual verification where required.
          </p>
        </div>

      </div>
    </div>
  );
}

function MiniScore({ label, score, invertColor = false }: { label: string, score: number, invertColor?: boolean }) {
  const isGood = invertColor ? score < 40 : score >= 60;
  const isBad = invertColor ? score >= 70 : score < 40;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-sm font-black text-slate-900">{score}/100</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : isBad ? 'bg-red-500' : 'bg-amber-400'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function ValidationRow({ label, valid }: { label: string, valid: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", valid ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400')}>
        {valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      </div>
      <span className={cn("text-sm font-medium", valid ? 'text-slate-300' : 'text-amber-300')}>{label}</span>
    </div>
  );
}

function ConfidenceDriver({ label, valid }: { label: string, valid: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5">
        {valid ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
      </div>
      <span className="text-sm font-medium text-slate-700 leading-snug">{label}</span>
    </li>
  );
}
