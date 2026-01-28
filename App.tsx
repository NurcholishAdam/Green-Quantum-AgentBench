
import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import QuantumGraph from './components/QuantumGraph';
import GreenParetoChart from './components/GreenParetoChart';
import MultilingualMosaic from './components/MultilingualMosaic';
import { MOCK_AGENTS } from './constants';
import { 
  getDeepModuleAnalysis, 
  syncModuleWithRealWorld, 
  SearchResult, 
  getQuantumTelemetry, 
  getGreenTelemetry,
  getMultilingualTelemetry,
  getProvenanceTelemetry,
  getErrorCorrectionTelemetry,
  getDatasetTelemetry
} from './services/geminiService';

type TabType = 'dashboard' | 'quantum' | 'green' | 'multilingual' | 'qlgraph' | 'error' | 'dataset';

interface Insight {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  progress: number;
}

interface TelemetryLog {
  timestamp: string;
  label: string;
  oldValue: string;
  newValue: string;
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
            description="Real-time benchmarking of quantum gate fidelity through the lens of AgentBeats Robust Scoring. We evaluate gate accuracy against cryogenic energy overhead to maintain a sustainable Pareto frontier."
            onAnalyze={handleDeepAnalysis}
            showTelemetryButton={true}
            telemetryType="quantum"
            initialInsights={[
              { label: "Gate Accuracy", value: "99.991%", subtext: "Standard CZ Fidelity", icon: "fa-crosshairs", progress: 99 },
              { label: "Coherence Stability", value: "88.4%", subtext: "Upgraded Reasoning Kernel", icon: "fa-wave-square", progress: 88 },
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
            description="Our primary sustainability vector for A2A Compliance. This module tracks micro-joule per token efficiency and carbon footprint intensity (gCO2eq). By enforcing independent evaluation nodes, we ensure verifiable green benchmarks."
            onAnalyze={handleDeepAnalysis}
            showTelemetryButton={true}
            telemetryType="green"
            initialInsights={[
              { label: "Energy Intensity", value: "0.12μJ/T", subtext: "B200 cluster baseline", icon: "fa-bolt", progress: 96 },
              { label: "Carbon Trace", value: "0.08g/hr", subtext: "Clean Grid Purity", icon: "fa-cloud-sun", progress: 82 },
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
            description="Evaluation of cross-lingual reasoning independence. We benchmark zero-shot semantic accuracy across 124+ ISO languages, analyzing how token-latency symmetry affects the global research nodes."
            onAnalyze={handleDeepAnalysis}
            showTelemetryButton={true}
            telemetryType="multilingual"
            initialInsights={[
              { label: "Semantic Accuracy", value: "48.2", subtext: "Flores-200 Average", icon: "fa-spell-check", progress: 85 },
              { label: "Inference Latency", value: "110ms", subtext: "Cross-script mean", icon: "fa-clock", progress: 70 },
              { label: "Low-Resource Stability", value: "0.64", subtext: "Stability coefficient", icon: "fa-chart-simple", progress: 64 }
            ]}
          />
        );
      case 'qlgraph':
        return (
          <ModuleViewer 
            title="QL-Graph Provenance" 
            icon="fa-network-wired" 
            color="blue" 
            description="Visualizing the lineage of agent decisions via high-fidelity, synchronized nodes. This module ensures Data Provenance and Independence by tracing the causal decision path."
            onAnalyze={handleDeepAnalysis}
            showTelemetryButton={true}
            telemetryType="qlgraph"
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
            description="Monitoring Surface Code resilience (d=7) for fault-tolerant agentic reasoning. We implement a robust scoring feedback loop to predict failure modes."
            onAnalyze={handleDeepAnalysis}
            showTelemetryButton={true}
            telemetryType="error"
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
            description="Dynamic exploration of the AgentBeats training corpus. This module validates data purity against the A2A handshake protocol."
            onAnalyze={handleDeepAnalysis}
            showTelemetryButton={true}
            telemetryType="dataset"
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
                      <h4 className="text-3xl font-black text-white tracking-tighter uppercase italic">Synthesizing Industrial White Paper...</h4>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto font-light leading-relaxed">
                        Evaluating AgentBeats vectors: A2A Compliance, Sustainability, and Independent Scoring.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-emerald max-w-none prose-lg">
                    {analysisContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm transition-all duration-300 group ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
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
  onAnalyze: (title: string, insights: Insight[]) => void,
  showTelemetryButton?: boolean,
  telemetryType?: 'quantum' | 'green' | 'multilingual' | 'qlgraph' | 'error' | 'dataset'
}> = ({ title, icon, color, description, initialInsights, onAnalyze, showTelemetryButton, telemetryType }) => {
  const [insights, setInsights] = useState(initialInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingTelemetry, setIsFetchingTelemetry] = useState(false);
  const [syncResult, setSyncResult] = useState<SearchResult | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const sync = await syncModuleWithRealWorld(title, insights);
      setSyncResult(sync);
      if (sync.updatedInsights) setInsights(prev => prev.map(o => ({...o, ...(sync.updatedInsights?.find(u => u.label === o.label) || {}) })));
    } finally { setIsRefreshing(false); }
  };

  const handleTelemetryUplink = async () => {
    setIsFetchingTelemetry(true);
    try {
      let telemetry;
      switch (telemetryType) {
        case 'green':
          telemetry = await getGreenTelemetry(insights);
          break;
        case 'multilingual':
          telemetry = await getMultilingualTelemetry(insights);
          break;
        case 'qlgraph':
          telemetry = await getProvenanceTelemetry(insights);
          break;
        case 'error':
          telemetry = await getErrorCorrectionTelemetry(insights);
          break;
        case 'dataset':
          telemetry = await getDatasetTelemetry(insights);
          break;
        case 'quantum':
        default:
          telemetry = await getQuantumTelemetry(insights);
          break;
      }

      if (telemetry?.length > 0) {
        const newLogs: TelemetryLog[] = [];
        setInsights(prev => prev.map(old => {
          const match = telemetry.find((t: any) => t.label === old.label);
          if (match && match.value !== old.value) newLogs.push({ timestamp: new Date().toLocaleTimeString(), label: old.label, oldValue: old.value, newValue: match.value });
          return match ? { ...old, ...match } : old;
        }));
        setTelemetryLogs(prev => [...prev, ...newLogs].slice(-10));
      }
    } finally { setIsFetchingTelemetry(false); }
  };

  const colorMap: any = { 
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/10', 
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/10 shadow-violet-500/10', 
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10 shadow-blue-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-amber-500/10',
    red: 'text-red-400 border-red-500/20 bg-red-500/10 shadow-red-500/10'
  };

  return (
    <div className="p-12 md:p-24 min-h-full space-y-20 animate-in fade-in zoom-in-95 duration-1000 relative overflow-x-hidden">
      
      {isFetchingTelemetry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-none transition-all duration-500">
           <div className={`bg-[#111] border ${
             telemetryType === 'green' ? 'border-emerald-500/30 shadow-emerald-500/20' : 
             telemetryType === 'multilingual' ? 'border-blue-500/30 shadow-blue-500/20' : 
             telemetryType === 'error' ? 'border-red-500/30 shadow-red-500/20' :
             telemetryType === 'dataset' ? 'border-amber-500/30 shadow-amber-500/20' :
             'border-violet-500/30 shadow-violet-500/20'} p-12 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center space-y-8 animate-in zoom-in-95`}>
              <div className={`w-20 h-20 rounded-full border-[3px] ${
                telemetryType === 'green' ? 'border-emerald-500/20 border-t-emerald-500' : 
                telemetryType === 'multilingual' ? 'border-blue-500/20 border-t-blue-500' : 
                telemetryType === 'error' ? 'border-red-500/20 border-t-red-500' :
                telemetryType === 'dataset' ? 'border-amber-500/20 border-t-amber-500' :
                'border-violet-500/20 border-t-violet-500'} animate-spin`}></div>
              <div className="text-center space-y-2">
                 <h4 className={`text-sm font-black uppercase tracking-[0.5em] ${
                   telemetryType === 'green' ? 'text-emerald-400' : 
                   telemetryType === 'multilingual' ? 'text-blue-400' : 
                   telemetryType === 'error' ? 'text-red-400' :
                   telemetryType === 'dataset' ? 'text-amber-400' :
                   'text-violet-400'}`}>Reasoning_Kernel_Uplink</h4>
                 <p className="text-[11px] text-gray-500 font-mono animate-pulse">Establishing secure telemetry tunnel to global 2025 ground-truth nodes...</p>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className={`w-44 h-44 rounded-[3.5rem] border-[3px] flex items-center justify-center text-7xl shadow-2xl ${colorMap[color]} transition-transform hover:scale-105 duration-700`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="text-center md:text-left space-y-6 max-w-4xl">
          <div className="flex items-center justify-center md:justify-start gap-4">
             <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">AgentBeats Objective Node</span>
             <div className={`w-2.5 h-2.5 rounded-full bg-emerald-500/40 animate-pulse`}></div>
          </div>
          <h1 className="text-8xl font-black text-white tracking-tighter leading-none">{title}</h1>
          <p className="text-2xl text-gray-400 font-light leading-relaxed border-l-4 border-emerald-500/30 pl-10 max-w-3xl">{description}</p>
        </div>
      </div>

      {telemetryType === 'green' && (
        <div className="animate-in slide-in-from-bottom-12 duration-1000">
           <GreenParetoChart insights={insights} />
        </div>
      )}

      {(telemetryType === 'quantum' || telemetryType === 'qlgraph' || telemetryType === 'error') && (
        <div className="animate-in slide-in-from-bottom-12 duration-1000">
           <QuantumGraph data={{nodes: [], links: []}} />
        </div>
      )}

      {telemetryType === 'multilingual' && (
        <div className="animate-in slide-in-from-bottom-12 duration-1000">
           <MultilingualMosaic />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {insights.map((insight, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-12 rounded-[4rem] space-y-10 shadow-2xl relative group overflow-hidden transition-all hover:border-emerald-500/20 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center ${colorMap[color]} bg-opacity-5 border border-white/10 transition-all group-hover:scale-110`}>
                <i className={`fa-solid ${insight.icon} text-4xl`}></i>
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Vector_0{i+1}</span>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-600">{insight.label}</h3>
              <p className="text-7xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">{insight.value}</p>
              <p className="text-sm text-gray-500 font-light italic leading-relaxed">{insight.subtext}</p>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
              <div className={`h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]`} style={{ width: `${insight.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {showTelemetryButton && telemetryLogs.length > 0 && (
        <div className="bg-black/90 border border-emerald-500/20 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-right-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <i className="fa-solid fa-satellite-dish text-9xl text-emerald-500"></i>
          </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.5em] font-mono">RealTime_Metrics_Stream</h4>
            </div>
            <span className="text-[9px] font-mono text-gray-600">CONNECTED // RESEARCH_NODE_GAO</span>
          </div>
          <div ref={logContainerRef} className="h-40 overflow-y-auto space-y-3 pr-6 custom-scrollbar font-mono text-[11px]">
            {telemetryLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-6 text-gray-500 border-l-2 border-emerald-500/10 pl-6 py-2 transition-all hover:bg-white/5 hover:border-emerald-500/40 rounded-r-xl">
                <span className="text-gray-700 shrink-0">[{log.timestamp}]</span>
                <span className="text-gray-300 font-bold uppercase tracking-tighter w-40 shrink-0">{log.label}</span>
                <span className="line-through opacity-30 shrink-0">{log.oldValue}</span>
                <i className="fa-solid fa-angles-right text-emerald-500 text-[9px] shrink-0"></i>
                <span className="text-emerald-400 font-black shrink-0">{log.newValue}</span>
                <span className="text-[9px] text-gray-700 italic ml-auto uppercase tracking-widest">Verifiable_Handshake_OK</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-16">
        <button 
          onClick={() => onAnalyze(title, insights)} 
          className="px-20 py-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2.5rem] text-[13px] font-black tracking-[0.4em] uppercase transition-all shadow-2xl hover:scale-105 active:scale-95 group"
        >
          <i className="fa-solid fa-file-contract mr-4 text-emerald-500 transition-transform group-hover:rotate-6"></i>
          Synthesize technical paper
        </button>
        
        {showTelemetryButton && (
          <button 
            onClick={handleTelemetryUplink} 
            disabled={isFetchingTelemetry} 
            className="px-20 py-8 bg-emerald-900/40 hover:bg-emerald-800/60 border-2 border-emerald-500/50 rounded-[3rem] text-[13px] font-black tracking-[0.4em] uppercase transition-all flex items-center gap-6 text-emerald-100 shadow-[0_0_50px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <i className={`fa-solid ${isFetchingTelemetry ? 'fa-spinner fa-spin' : 'fa-bolt-lightning'} text-xl`}></i>
            {isFetchingTelemetry ? 'Establishing_Uplink...' : 'Trigger Real-Time Kernel Update'}
          </button>
        )}

        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing} 
          className="px-20 py-8 bg-emerald-600 hover:bg-emerald-500 rounded-[2.5rem] text-[13px] font-black tracking-[0.4em] uppercase transition-all text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
        >
          <i className={`fa-solid ${isRefreshing ? 'fa-sync fa-spin' : 'fa-satellite'} mr-4`}></i>
          Update Pareto Nodes
        </button>
      </div>

      <div className="pt-24 opacity-20 hover:opacity-100 transition-opacity duration-1000">
         <div className="flex flex-wrap items-center justify-center gap-16 border-t border-white/5 pt-16">
            <div className="flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">
               <i className="fa-solid fa-shield-halved text-emerald-500 text-xl"></i>
               A2A_ISO_42001
            </div>
            <div className="flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">
               <i className="fa-solid fa-dna text-blue-500 text-xl"></i>
               DATA_PROVENANCE_SYNC
            </div>
            <div className="flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">
               <i className="fa-solid fa-microscope text-violet-500 text-xl"></i>
               PARETO_ROBUST_SCORING
            </div>
         </div>
      </div>
    </div>
  );
};

export default App;
