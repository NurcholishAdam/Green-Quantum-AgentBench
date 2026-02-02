
import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import QuantumGraph from './components/QuantumGraph';
import GreenParetoChart from './components/GreenParetoChart';
import MultilingualMosaic from './components/MultilingualMosaic';
import { MOCK_AGENTS } from './constants';
import { 
  getDeepModuleAnalysis, 
  syncModuleWithRealWorld, 
  getQuantumTelemetry, 
  getGreenTelemetry,
  getMultilingualTelemetry,
  getProvenanceTelemetry,
  getErrorCorrectionTelemetry,
  getDatasetTelemetry,
  getGraphTelemetry
} from './services/geminiService';
import { QuantumGraphData } from './types';

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
      case 'dashboard': return <Dashboard />;
      case 'quantum':
        return (
          <ModuleViewer 
            title="Quantum Simulation Modules" 
            icon="fa-microchip" color="violet" 
            description="Evaluating gate accuracy vs cryogenic overhead to maintain a sustainable Pareto frontier."
            onAnalyze={handleDeepAnalysis} showTelemetryButton={true} telemetryType="quantum"
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
            title="Green Energy Metrics" icon="fa-leaf" color="emerald" 
            description="Our primary sustainability vector for A2A Compliance. Tracks micro-joule per token efficiency."
            onAnalyze={handleDeepAnalysis} showTelemetryButton={true} telemetryType="green"
            initialInsights={[
              { label: "Energy Intensity", value: "0.12μJ/T", subtext: "B200 cluster baseline", icon: "fa-bolt", progress: 96 },
              { label: "Carbon Trace", value: "0.08g/hr", subtext: "Clean Grid Purity", icon: "fa-cloud-sun", progress: 82 },
              { label: "Objective Balance", value: "0.94", subtext: "Pareto optimal score", icon: "fa-scale-balanced", progress: 94 }
            ]}
          />
        );
      case 'qlgraph':
        return (
          <ModuleViewer 
            title="QL-Graph Provenance" icon="fa-network-wired" color="blue" 
            description="Visualizing the lineage of agent decisions via high-fidelity, synchronized nodes."
            onAnalyze={handleDeepAnalysis} showTelemetryButton={true} telemetryType="qlgraph"
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
            title="Quantum Error Correction" icon="fa-shield-halved" color="red" 
            description="Monitoring Surface Code resilience (d=7) for fault-tolerant agentic reasoning."
            onAnalyze={handleDeepAnalysis} showTelemetryButton={true} telemetryType="error"
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
            title="Dataset Explorer" icon="fa-database" color="amber" 
            description="Dynamic exploration of the AgentBeats training corpus. Validates purity against A2A handshake."
            onAnalyze={handleDeepAnalysis} showTelemetryButton={true} telemetryType="dataset"
            initialInsights={[
              { label: "Corpus Purity", value: "99.2%", subtext: "A2A governance check", icon: "fa-check-double", progress: 100 },
              { label: "Collection Carbon", value: "1.2kg", subtext: "Lifecycle crawling cost", icon: "fa-leaf", progress: 65 },
              { label: "Access Latency", value: "2.4ms", subtext: "Research Node GAO", icon: "fa-database", progress: 98 }
            ]}
          />
        );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a]">
      <nav className="w-full md:w-64 bg-[#080808] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-bolt text-xs text-white"></i>
            </div>
            <span className="font-bold tracking-tight text-lg">AGENT<span className="text-emerald-500">BEATS</span></span>
          </div>
        </div>
        <div className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon="fa-chart-pie" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon="fa-microchip" label="Quantum Modules" active={activeTab === 'quantum'} onClick={() => setActiveTab('quantum')} />
          <NavItem icon="fa-leaf" label="Green Metrics" active={activeTab === 'green'} onClick={() => setActiveTab('green')} />
          <NavItem icon="fa-network-wired" label="QL-Graph Prov" active={activeTab === 'qlgraph'} onClick={() => setActiveTab('qlgraph')} />
          <NavItem icon="fa-shield-halved" label="Error Correction" active={activeTab === 'error'} onClick={() => setActiveTab('error')} />
          <NavItem icon="fa-database" label="Dataset Explorer" active={activeTab === 'dataset'} onClick={() => setActiveTab('dataset')} />
        </div>
      </nav>
      <main className="flex-grow overflow-y-auto bg-[#0a0a0a] relative">
        {renderContent()}
        {analysisContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/90" onClick={() => setAnalysisContent(null)}></div>
             <div className="relative w-full max-w-4xl bg-[#111] p-10 rounded-3xl border border-white/10 max-h-[80vh] overflow-y-auto prose prose-invert">
                {analysisContent}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm transition-all group ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <i className={`fa-solid ${icon} w-6 text-center ${active ? 'text-emerald-500' : 'text-gray-500'}`}></i>
    <span className="font-bold">{label}</span>
  </button>
);

const ModuleViewer: React.FC<{ 
  title: string, icon: string, color: string, description: string, initialInsights: Insight[],
  onAnalyze: (title: string, insights: Insight[]) => void,
  showTelemetryButton?: boolean,
  telemetryType?: 'quantum' | 'green' | 'qlgraph' | 'error' | 'dataset'
}> = ({ title, icon, color, description, initialInsights, onAnalyze, showTelemetryButton, telemetryType }) => {
  const [insights, setInsights] = useState(initialInsights);
  const [isFetchingTelemetry, setIsFetchingTelemetry] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [graphData, setGraphData] = useState<QuantumGraphData>({
    nodes: [
      { id: 'n1', label: 'Inception_Root', type: 'agent', val: 90 },
      { id: 'n2', label: 'Logic_Gate_Alpha', type: 'quantum', val: 75 },
      { id: 'n3', label: 'Fault_Sensor', type: 'error', val: 40 },
      { id: 'n4', label: 'Lineage_Sync', type: 'provenance', val: 88 }
    ],
    links: [
      { source: 'n1', target: 'n2', weight: 15 },
      { source: 'n2', target: 'n3', weight: 8 },
      { source: 'n4', target: 'n1', weight: 20 }
    ]
  });

  const handleTelemetryUplink = async () => {
    setIsFetchingTelemetry(true);
    try {
      let telemetry;
      let newGraph;
      
      switch (telemetryType) {
        case 'green': telemetry = await getGreenTelemetry(insights); break;
        case 'qlgraph': 
          telemetry = await getProvenanceTelemetry(insights); 
          newGraph = await getGraphTelemetry('provenance');
          break;
        case 'error': 
          telemetry = await getErrorCorrectionTelemetry(insights); 
          newGraph = await getGraphTelemetry('error');
          break;
        case 'dataset': telemetry = await getDatasetTelemetry(insights); break;
        default: 
          telemetry = await getQuantumTelemetry(insights); 
          newGraph = await getGraphTelemetry('quantum');
          break;
      }

      if (telemetry) {
        setInsights(prev => prev.map(old => {
          const match = telemetry.find((t: any) => t.label === old.label);
          if (match && match.value !== old.value) {
            setTelemetryLogs(l => [{timestamp: new Date().toLocaleTimeString(), label: old.label, oldValue: old.value, newValue: match.value}, ...l].slice(0, 10));
          }
          return match ? { ...old, ...match } : old;
        }));
      }

      if (newGraph && newGraph.nodes.length > 0) {
        setGraphData(newGraph);
      }
    } finally { setIsFetchingTelemetry(false); }
  };

  const colorMap: any = { 
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', 
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/10', 
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    red: 'text-red-400 border-red-500/20 bg-red-500/10'
  };

  return (
    <div className="p-12 md:p-24 min-h-full space-y-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className={`w-44 h-44 rounded-[3.5rem] border-[3px] flex items-center justify-center text-7xl shadow-2xl ${colorMap[color]}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="space-y-6 max-w-4xl text-center md:text-left">
          <h1 className="text-8xl font-black text-white tracking-tighter leading-none">{title}</h1>
          <p className="text-2xl text-gray-400 font-light leading-relaxed border-l-4 border-emerald-500/30 pl-10">{description}</p>
        </div>
      </div>

      {(telemetryType === 'qlgraph' || telemetryType === 'quantum' || telemetryType === 'error') && (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
           <QuantumGraph data={graphData} />
        </div>
      )}

      {telemetryType === 'green' && (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
           <GreenParetoChart insights={insights} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {insights.map((insight, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-12 rounded-[4rem] space-y-10 shadow-2xl hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center ${colorMap[color]} bg-opacity-5 border border-white/10`}>
                <i className={`fa-solid ${insight.icon} text-4xl`}></i>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-600">{insight.label}</h3>
              <p className="text-7xl font-black text-white tracking-tighter">{insight.value}</p>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 rounded-full" style={{ width: `${insight.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12">
        <button onClick={() => onAnalyze(title, insights)} className="px-20 py-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.4em] transition-all">TECHNICAL_WHITE_PAPER</button>
        {showTelemetryButton && (
          <button onClick={handleTelemetryUplink} disabled={isFetchingTelemetry} className="px-20 py-8 bg-emerald-900/40 border-2 border-emerald-500/50 rounded-[3rem] text-[13px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-6">
            <i className={`fa-solid ${isFetchingTelemetry ? 'fa-spinner fa-spin' : 'fa-bolt-lightning'}`}></i>
            {isFetchingTelemetry ? 'ESTABLISHING_UPLINK...' : 'UPGRADE_REALTIME_PROVENANCE'}
          </button>
        )}
      </div>

      {telemetryLogs.length > 0 && (
        <div className="bg-black/90 border border-emerald-500/20 rounded-[3rem] p-10 shadow-2xl">
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-6">RealTime_Upgrades_Log</h4>
          <div className="space-y-3 font-mono text-[11px] h-40 overflow-y-auto custom-scrollbar">
            {telemetryLogs.map((log, idx) => (
              <div key={idx} className="flex gap-6 text-gray-500 border-l-2 border-emerald-500/10 pl-6 py-2">
                <span className="text-gray-700">[{log.timestamp}]</span>
                <span className="text-gray-300 font-bold uppercase">{log.label}</span>
                <span className="line-through opacity-30">{log.oldValue}</span>
                <i className="fa-solid fa-angles-right text-emerald-500"></i>
                <span className="text-emerald-400 font-black">{log.newValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
