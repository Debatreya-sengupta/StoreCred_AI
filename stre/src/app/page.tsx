"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, MapPin, ShieldAlert, FileSearch, TrendingUp } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { MetricCard } from "@/components/MetricCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-20 lg:py-32">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm mb-6 border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI-Powered Lending Intelligence
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Remote Cash Flow Underwriting for <span className="text-emerald-600">Kirana Stores</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              StoreCred AI helps lenders estimate store revenue from images and location without requiring formal bookkeeping or bank statements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link 
                href="/assess"
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition"
              >
                Run Demo Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/underwriter"
                className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition"
              >
                View Underwriter Dashboard
              </Link>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5"><CheckIcon /> Explainable outputs</div>
              <div className="flex items-center gap-1.5"><CheckIcon /> Fraud-aware checks</div>
              <div className="flex items-center gap-1.5"><CheckIcon /> Confidence scoring</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            {/* Mock Dashboard Preview */}
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform rotate-2 hover:rotate-0 transition duration-500">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment Preview</div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Kirana Store 104</h3>
                    <p className="text-sm text-slate-500">Mumbai, 400001</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">Pre-Approve</div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <div className="flex-1 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <div className="w-full h-full bg-slate-200 animate-pulse"></div>
                    </div>
                    <div className="flex-1 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <div className="w-full h-full bg-slate-200 animate-pulse delay-75"></div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">Est. Monthly Revenue</div>
                    <div className="text-2xl font-bold text-slate-900">₹85,000 - ₹1.2L</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 p-2.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-100">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  High visual-geo consistency
                </div>
              </div>
            </div>
            
            {/* Decorative blurs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
            <div className="px-4">
              <div className="text-slate-900 font-bold mb-1">No Bank Statements</div>
              <div className="text-sm text-slate-500">Frictionless onboarding</div>
            </div>
            <div className="px-4">
              <div className="text-slate-900 font-bold mb-1">Multi-Signal Analysis</div>
              <div className="text-sm text-slate-500">Vision + Location Data</div>
            </div>
            <div className="px-4">
              <div className="text-slate-900 font-bold mb-1">Confidence-Aware</div>
              <div className="text-sm text-slate-500">Know when to verify manually</div>
            </div>
            <div className="px-4">
              <div className="text-slate-900 font-bold mb-1">Fraud-Resilient</div>
              <div className="text-sm text-slate-500">Cross-signal contradiction checks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Capabilities</h2>
            <p className="text-slate-600">A multi-modal approach to inferring steady-state business health.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Vision Intelligence"
              description="Extract business signals directly from interior and exterior shop photos."
              icon={<Camera className="w-6 h-6" />}
              bullets={[
                "Shelf Density Index",
                "SKU Diversity Proxy",
                "Inventory Strength",
                "Refill Signal Detection"
              ]}
            />
            <FeatureCard 
              title="Geo Intelligence"
              description="Contextualize the store's potential using hyper-local spatial signals."
              icon={<MapPin className="w-6 h-6" />}
              bullets={[
                "Footfall Proxy Estimation",
                "Catchment Score",
                "Competition Density",
                "Road Visibility Proxy"
              ]}
            />
            <FeatureCard 
              title="Fraud & Risk Checks"
              description="Automatically flag inconsistencies between visual and location data."
              icon={<ShieldAlert className="w-6 h-6" />}
              bullets={[
                "Evidence Quality Scoring",
                "Inventory-Footfall Mismatch",
                "Staged Stock Suspicion",
                "Metadata Consistency"
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600">Four steps from raw images to actionable underwriting logic.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-slate-100 z-0"></div>
            
            {[
              { step: 1, title: "Upload Evidence", desc: "Submit store photos and basic location data.", icon: <Camera className="w-5 h-5" /> },
              { step: 2, title: "Analyze Signals", desc: "AI extracts visual and geo-spatial features.", icon: <FileSearch className="w-5 h-5" /> },
              { step: 3, title: "Infer Cashflow", desc: "Calculate revenue proxy bands with confidence.", icon: <TrendingUp className="w-5 h-5" /> },
              { step: 4, title: "Generate Decision", desc: "Produce explainable recommendation logic.", icon: <ShieldAlert className="w-5 h-5" /> }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-emerald-600 font-bold text-xl mb-6 relative">
                  {item.icon}
                  <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it Matters */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why this matters for NBFCs</h2>
              <div className="space-y-6 text-slate-300">
                <p>
                  Informal retail constitutes a massive market, yet traditional underwriting fails because these businesses lack formal bookkeeping and bank statements.
                </p>
                <p>
                  Field verification is slow, expensive, and subject to human bias. 
                  StoreCred AI transforms physical proxy signals into a structured, explainable credit decision, enabling rapid, objective pre-screening.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Faster Screening", desc: "Reduce TAT from days to minutes." },
                { title: "Lower Opex", desc: "Minimize physical field visits." },
                { title: "Better Consistency", desc: "Standardize subjective visual checks." },
                { title: "Explainable Decisions", desc: "Clear logic for credit committees." }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                  <h4 className="font-bold text-emerald-400 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-emerald-600 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to test the prototype?</h2>
          <p className="text-emerald-100 mb-10 max-w-2xl mx-auto text-lg">
            Run a live simulation to see how visual and location signals generate explainable cashflow estimates.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/assess"
              className="bg-white text-emerald-700 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition"
            >
              Run Demo Assessment
            </Link>
            <Link 
              href="/underwriter"
              className="bg-emerald-700 text-white border border-emerald-500 px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-800 transition"
            >
              View Underwriter Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
