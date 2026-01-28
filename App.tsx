
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { MOCK_AGENTS } from './constants';
import { getDeepModuleAnalysis, syncModuleWithRealWorld, SearchResult } from './services/geminiService';

type TabType = 'dashboard' | 'quantum' | 'green' | 'multilingual' | 'qlgraph' | 'error' | 'dataset';

interface Insight {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  progress: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDeepAnalysis = async (title: string, insights: Insight[]) => {
    setIsAnalyzing(true);
    setAnalysisContent(null);
    try {
      const result = await getDeepModuleAnalysis(title, insights);
      setAnalysisContent(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'quantum':
        return (
          <ModuleViewer 
            title="Quantum Simulation Modules" 
            icon="fa-microchip" 
            color="violet" 
            description="Evaluating the Accuracy-Latency trade-offs in high-fidelity gate benchmarking for the 2025 AgentBeats ecosystem."
            onAnalyze={handleDeepAnalysis}
            initialInsights={[
              { label: "Gate Accuracy", value: "99.991%", subtext: "Standard CZ Fidelity", icon: "fa-crosshairs", progress: 99 },
              { label: "Control Latency", value: "42ms", subtext: "Real-time sync overhead", icon: "fa-stopwatch", progress: 85 },
              { label: "Energy Flux", value: "0.15μJ", subtext: "Cryogenic overhead cost", icon: "fa-snowflake", progress: 78 }
            ]}
          />
        );
      case 'green':
        return (
          <ModuleViewer 
            title="Green Energy Metrics" 
            icon="fa-leaf" 
            color="emerald" 
            description="Multi-objective analysis of micro-joule per token efficiency against carbon-offset intensity (PUE 1.05 targets)."
            onAnalyze={handleDeepAnalysis}
            initialInsights={[
              { label: "Energy Efficiency", value: "0.12μJ/T", subtext: "SOTA 2025 B200 baseline", icon: "fa-bolt", progress: 96 },
              { label: "Carbon Footprint", value: "0.08g/hr", subtext: "Clean Grid Purity", icon: "fa-cloud-sun", progress: 82 },
              { label: "Objective Balance", value: "0.94", subtext: "Pareto optimal score", icon: "fa-scale-balanced", progress: 94 }
            ]}
          />
        );
      case 'multilingual':
        return (
          <ModuleViewer 
            title="Multilingual Benchmarks" 
            icon="fa-language" 
            color="blue" 
            description="Benchmarking zero-shot semantic accuracy across 124+ ISO languages with a focus on token-latency symmetry."
            onAnalyze={handleDeepAnalysis}
            initialInsights={[
              { label: "Semantic Accuracy", value: "48.2", subtext: "Flores-200 Average", icon: "fa-spell-check", progress: 85 },
              { label: "Inference Latency", value: "110ms", subtext: "Cross-script mean", icon: "fa-clock", progress: 70 },
              { label: "Resource Ratio", value: "1:4.2", subtext: "High vs Low resource", icon: "fa-chart-simple", progress: 90 }
            ]}
          />
        );
      case 'qlgraph':
        return (
          <ModuleViewer 
            title="QL-Graph Provenance" 
            icon="fa-network-wired" 
            color="blue" 
            description="Synchronized tracing of decision lineage, optimizing for provenance transparency versus computational energy overhead."
            onAnalyze={handleDeepAnalysis}
            initialInsights={[
              { label: "Lineage Clarity", value: "99.9%", subtext: "Data origin fidelity", icon: "fa-fingerprint", progress: 100 },
              { label: "Graph Entropy", value: "0.024b", subtext: "Decision path stability", icon: "fa-route", progress: 95 },
              { label: "Tracing Energy", value: "5.2mJ", subtext: "Lineage overhead cost", icon: "fa-battery-half", progress: 60 }
            ]}
          />
        );
      case 'error':
        return (
          <ModuleViewer 
            title="Quantum Error Correction" 
            icon="fa-shield-halved" 
            color="red" 
            description="Monitoring logical error resilience (d=7) against hardware resource consumption and physical cycle latency."
            onAnalyze={handleDeepAnalysis}
            initialInsights={[
              { label: "Logical Fidelity", value: "99.999%", subtext: "d=7 Distance Surface", icon: "fa-shield-heart", progress: 99 },
              { label: "Cycle Overhead", value: "18%", subtext: "Syndrome compute cost", icon: "fa-gears", progress: 45 },
              { label: "Repair Latency", value: "0.4μs", subtext: "Fault detection speed", icon: "fa-bolt-lightning", progress: 88 }
            ]}
          />
        );
      case 'dataset':
        return (
          <ModuleViewer 
            title="Dataset Explorer" 
            icon="fa-database" 
            color="amber" 
            description="Exploring the 2025 AgentBeats training corpus, validating accuracy metrics alongside source carbon-tracing."
            onAnalyze={handleDeepAnalysis}
            initialInsights={[
              { label: "Corpus Purity", value: "99.2%", subtext: "A2A governance check", icon: "fa-check-double", progress: 100 },
              { label: "Collection Carbon", value: "1.2kg", subtext: "Lifecycle crawling cost", icon: "fa-leaf", progress: 65 },
              { label: "Access Latency", value: "2.4ms", subtext: "Research Node GAO", icon: "fa-database", progress: 98 }
            ]}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a]">
      {/* Side Navigation */}
      <nav className="w-full md:w-64 bg-[#080808] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-bolt text-xs text-white"></i>
            </div>
            <span className="font-bold tracking-tight text-lg">AGENT<span className="text-emerald-500">BEATS</span></span>
          </div>
        </div>
        
        <div className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Navigation</div>
          <NavItem icon="fa-chart-pie" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon="fa-microchip" label="Quantum Modules" active={activeTab === 'quantum'} onClick={() => setActiveTab('quantum')} />
          <NavItem icon="fa-leaf" label="Green Metrics" active={activeTab === 'green'} onClick={() => setActiveTab('green')} />
          <NavItem icon="fa-language" label="Multilingual Bench" active={activeTab === 'multilingual'} onClick={() => setActiveTab('multilingual')} />
          <div className="pt-8 px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Infrastructure</div>
          <NavItem icon="fa-network-wired" label="QL-Graph Prov" active={activeTab === 'qlgraph'} onClick={() => setActiveTab('qlgraph')} />
          <NavItem icon="fa-shield-halved" label="Error Correction" active={activeTab === 'error'} onClick={() => setActiveTab('error')} />
          <NavItem icon="fa-database" label="Dataset Explorer" active={activeTab === 'dataset'} onClick={() => setActiveTab('dataset')} />
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center space-x-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 overflow-hidden">
               <img src="https://picsum.photos/100/100" alt="Avatar" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-tight">Research_Node_X7</p>
              <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ESTABLISHED
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto bg-[#0a0a0a] relative">
        {renderContent()}

        {/* Technical White Paper Modal */}
        {(isAnalyzing || analysisContent) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => !isAnalyzing && setAnalysisContent(null)}></div>
            <div className="relative w-full max-w-5xl bg-[#0d0d0d] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col max-h-[92vh] shadow-[0_0_120px_rgba(0,0,0,0.9)]">
              
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-[#111] to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                    <i className="fa-solid fa-file-invoice text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tighter text-white">White Paper: Multi-Objective Audit</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-mono tracking-[0.3em] flex items-center gap-3">
                      <span className="text-emerald-500">PARETO_FRONTIER_ANALYSIS</span>
                      <span>•</span>
                      <span>GA-X7-BEATS-SYNTH</span>
                    </p>
                  </div>
                </div>
                {!isAnalyzing && (
                  <button onClick={() => setAnalysisContent(null)} className="p-4 hover:bg-white/5 rounded-3xl transition-all border border-transparent hover:border-white/10">
                    <i className="fa-solid fa-xmark text-2xl text-gray-500"></i>
                  </button>
                )}
              </div>
              
              <div className="flex-grow overflow-y-auto p-16 custom-scrollbar bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent)]">
                {isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-12 py-24">
                    <div className="relative">
                      <div className="w-28 h-28 border-[3px] border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                      <i className="fa-solid fa-feather-pointed absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse text-4xl"></i>
                    </div>
                    <div className="text-center space-y-4">
                      <h4 className="text-3xl font-black text-white tracking-tighter uppercase italic">Synthesizing Formal Report...</h4>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto font-light leading-relaxed">
                        "Evaluating 4-vector optimization: Accuracy, Energy, Carbon, Latency. High-reasoning protocol active."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-none text-gray-300 leading-relaxed font-light font-serif">
                    <div className="bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/10 mb-12 italic text-sm text-emerald-400 flex items-start gap-4">
                      <i className="fa-solid fa-quote-left text-2xl opacity-40"></i>
                      <span>This document provides a quantitative evaluation of the module's performance on the Pareto frontier, integrating real-time 2025 research standards from established academic repositories.</span>
                    </div>
                    <div className="prose prose-invert prose-emerald max-w-none prose-lg">
                      {analysisContent}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-black/50 flex items-center justify-between px-16">
                <div className="flex items-center gap-6 text-[10px] text-gray-600 font-mono tracking-widest">
                  <span className="flex items-center gap-2"><i className="fa-solid fa-shield-halved text-emerald-500"></i> ISO-42001 COMPLIANT</span>
                  <span className="flex items-center gap-2"><i className="fa-solid fa-fingerprint"></i> SIGNATURE: BEATS_001</span>
                </div>
                <button onClick={() => setAnalysisContent(null)} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)]">Archive Report</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm transition-all duration-300 group ${
      active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.08)]' : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
  >
    <i className={`fa-solid ${icon} w-6 text-center transition-transform group-hover:scale-125 ${active ? 'text-emerald-500' : 'text-gray-500'}`}></i>
    <span className="font-bold tracking-tight">{label}</span>
  </button>
);

const ModuleViewer: React.FC<{ 
  title: string, 
  icon: string, 
  color: string, 
  description: string, 
  initialInsights: Insight[],
  onAnalyze: (title: string, insights: Insight[]) => void
}> = ({ title, icon, color, description, initialInsights, onAnalyze }) => {
  const [insights, setInsights] = useState(initialInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncResult, setSyncResult] = useState<SearchResult | null>(null);

  const colorMap: any = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/10',
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/10 shadow-violet-500/10',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10 shadow-blue-500/10',
    red: 'text-red-400 border-red-500/20 bg-red-500/10 shadow-red-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-amber-500/10',
  };

  const progressColor: any = {
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const sync = await syncModuleWithRealWorld(title, insights);
      setSyncResult(sync);
      if (sync.updatedInsights) {
        setInsights(prev => prev.map(old => {
          const match = sync.updatedInsights?.find(u => u.label === old.label);
          return match ? { ...old, ...match } : old;
        }));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-12 md:p-24 min-h-full space-y-20 animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className={`w-44 h-44 rounded-[3.5rem] border-[3px] flex items-center justify-center text-7xl shadow-2xl relative ${colorMap[color]} transform hover:rotate-3 transition-transform duration-700`}>
          <i className={`fa-solid ${icon}`}></i>
          <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-3xl bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center shadow-2xl">
            <i className="fa-solid fa-chart-line text-emerald-500 text-xl"></i>
          </div>
        </div>
        <div className="text-center md:text-left space-y-6 max-w-3xl">
          <div className="flex items-center justify-center md:justify-start gap-5">
             <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">Multi-Objective Node</span>
             <div className="flex gap-1">
               {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>)}
             </div>
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none">{title}</h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed border-l-4 border-emerald-500/20 pl-8">{description}</p>
        </div>
      </div>

      {/* Synchronized Intelligence Feed */}
      {syncResult && (
        <div className="bg-[#111] border border-blue-500/20 rounded-[3rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fa-solid fa-dna text-[12rem] text-blue-400"></i>
           </div>
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <i className="fa-solid fa-microscope text-2xl"></i>
                 </div>
                 <div>
                    <h4 className="font-black text-blue-400 uppercase tracking-[0.2em] text-xs">Research Intelligence Synchronized</h4>
                    <p className="text-[10px] text-gray-600 font-mono">NODE_STATUS: UPLINK_ESTABLISHED</p>
                 </div>
              </div>
              <button onClick={() => setSyncResult(null)} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-all hover:translate-x-1">Dismiss Intelligence <i className="fa-solid fa-chevron-right ml-2"></i></button>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-6">
                 <p className="text-lg text-gray-200 leading-relaxed font-serif italic border-l-4 border-blue-500/30 pl-10">
                    {syncResult.text.length > 500 ? syncResult.text.substring(0, 500) + '...' : syncResult.text}
                 </p>
              </div>
              <div className="space-y-6">
                 <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Industrial Standards Found (2025)</p>
                 <div className="grid grid-cols-1 gap-4">
                   {syncResult.sources.slice(0, 3).map((s, idx) => (
                     <a key={idx} href={s.uri} target="_blank" className="flex items-center gap-6 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 hover:border-blue-500/30 transition-all group/link shadow-xl">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500 group-hover/link:scale-110 transition-transform">
                           <i className="fa-solid fa-link"></i>
                        </div>
                        <span className="text-xs text-gray-400 font-bold tracking-tight truncate">{s.title || 'Academic Research Node'}</span>
                     </a>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Quantitative Insight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {insights.map((insight, i) => (
          <div 
            key={i} 
            className="bg-[#111] border border-white/5 p-12 rounded-[3.5rem] space-y-10 hover:border-emerald-500/20 transition-all hover:-translate-y-4 shadow-2xl relative group overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center ${colorMap[color]} bg-opacity-5 border border-white/10 group-hover:scale-110 transition-all duration-700`}>
                <i className={`fa-solid ${insight.icon} text-3xl`}></i>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">UNIT_VECTOR</span>
                <span className="text-sm font-black text-white">[{i+1}]</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">{insight.label}</h3>
              <p className="text-6xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors duration-500">{insight.value}</p>
              <p className="text-xs text-gray-500 font-light italic leading-relaxed h-10 overflow-hidden">{insight.subtext}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-700">
                <span>Objective Reliability</span>
                <span className="text-white">{Math.round(insight.progress)}%</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                <div 
                  className={`h-full ${progressColor[color]} transition-all duration-1000 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]`} 
                  style={{ width: `${insight.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-emerald-500/[0.05] transition-all"></div>
          </div>
        ))}
      </div>

      {/* Action Suite */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 pt-10">
        <button 
          onClick={() => onAnalyze(title, insights)}
          className="px-16 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] text-[12px] font-black tracking-[0.3em] uppercase transition-all flex items-center gap-5 group shadow-2xl hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-lg">
            <i className="fa-solid fa-file-signature text-xl"></i>
          </div>
          Generate White Paper
        </button>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-16 py-6 rounded-[2rem] text-[12px] font-black tracking-[0.3em] uppercase transition-all flex items-center gap-5 shadow-2xl disabled:opacity-50 relative overflow-hidden hover:scale-105 active:scale-95 ${color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30' : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30'} text-white`}
        >
          {isRefreshing && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
            <i className={`fa-solid ${isRefreshing ? 'fa-sync fa-spin' : 'fa-satellite'} text-xl`}></i>
          </div>
          {isRefreshing ? 'Audit in Progress...' : 'Trigger Industrial Sync'}
        </button>
      </div>

      {/* Compliance Footer */}
      <div className="flex flex-wrap items-center justify-center gap-12 pt-16 border-t border-white/5 opacity-40 grayscale hover:grayscale-0 transition-all">
         <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
            <i className="fa-solid fa-shield-halved text-emerald-500 text-lg"></i>
            SECURE_A2A_COMPLIANCE_V2.1
         </div>
         <div className="flex items-center gap-3 text-[11px] font-mono text-gray-600">
            <i className="fa-solid fa-server"></i>
            RESEARCH_NODE_GA-X7
         </div>
         <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
            <i className="fa-solid fa-clock-rotate-left"></i>
            HISTORICAL_ALIGNED: 2025_Q1
         </div>
         <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
            <i className="fa-solid fa-leaf text-emerald-400"></i>
            PUE_1.05_STANDARD
         </div>
      </div>
    </div>
  );
};

export default App;
