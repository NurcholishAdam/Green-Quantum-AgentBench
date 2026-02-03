
import React, { useState, useCallback, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import GreenParetoChart from './components/GreenParetoChart';
import QuantumGraph from './components/QuantumGraph';
import MultilingualMosaic from './components/MultilingualMosaic';
import PolicyAuditor from './components/PolicyAuditor';
import ChaosSimulator from './components/ChaosSimulator';
import OrchestratorView from './components/OrchestratorView';
import HardwareSelector from './components/HardwareSelector';
import LiveAssistant from './components/LiveAssistant';
import { 
  getQuantumTelemetry, 
  getGreenTelemetry, 
  getGraphTelemetry,
  getProvenanceTelemetry,
  calculateSScore
} from './services/geminiService';
import { QuantumGraphData, HardwareType } from './types';
import { HARDWARE_PROFILES } from './constants';

type TabType = 'dashboard' | 'orchestrator' | 'policy' | 'chaos' | 'quantum' | 'green' | 'provenance' | 'mosaic';

interface Insight {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  progress: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [hwContext, setHwContext] = useState<HardwareType>('H100_Cluster');
  
  const hwProfile = useMemo(() => HARDWARE_PROFILES[hwContext], [hwContext]);

  const [provenanceData, setProvenanceData] = useState<QuantumGraphData>({
    nodes: [
      { id: 'n1', label: 'Inception Node', type: 'provenance', val: 95 },
      { id: 'n2', label: 'Decision Logic', type: 'agent', val: 88 },
      { id: 'hw1', label: hwContext, type: 'hardware', val: 100 }
    ],
    links: [
      { source: 'n1', target: 'n2', weight: 12 },
      { source: 'n2', target: 'hw1', weight: 25 }
    ]
  });

  const handleUpdateProvenanceGraph = useCallback(async () => {
    const newData = await getGraphTelemetry('provenance');
    if (newData && newData.nodes.length > 0) {
      setProvenanceData(newData);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard hwProfile={hwProfile} />;
      case 'orchestrator':
        return (
          <ModuleViewer 
            title="Carbon Supervisor" 
            icon="fa-network-wired" 
            color="emerald" 
            description="Multi-agent orchestration using Carbon-Aware dispatch. Supervisor agents assign tasks based on energy prices and Scope 3 network penalties."
            initialInsights={[
              { label: "Orchestration Efficiency", value: "98.2%", subtext: "Alignment vs. Baseline", icon: "fa-chess", progress: 98 },
              { label: "Subtask Count", value: "3 Active", subtext: "Recursive splits", icon: "fa-diagram-successor", progress: 75 },
              { label: "Scope 3 Tracking", value: "Enabled", subtext: "Network Hop Penalties", icon: "fa-cloud", progress: 100 }
            ]}
            extraContent={() => <OrchestratorView hwType={hwContext} />}
          />
        );
      case 'mosaic':
        return (
          <ModuleViewer 
            title="Global Mosaic" 
            icon="fa-language" 
            color="violet" 
            description="Visualizing the cross-script semantic reach. Monitoring energy intensity of different scripts in the current hardware context."
            initialInsights={[
              { label: "Script Parity", value: "0.98", subtext: "ISO-Node alignment", icon: "fa-equals", progress: 98 },
              { label: "Token Symmetry", value: "94.2%", subtext: "Efficiency", icon: "fa-dna", progress: 94 },
              { label: "S-Score Stability", value: "0.82", subtext: "Fidelity flux", icon: "fa-wind", progress: 82 }
            ]}
            extraContent={() => <MultilingualMosaic />}
          />
        );
      case 'provenance':
        return (
          <ModuleViewer 
            title="QL-Graph Provenance" 
            icon="fa-diagram-project" 
            color="blue" 
            description="Recursive decision lineage with Hardware-Software co-design verification."
            initialInsights={[
              { label: "Node Integrity", value: "98.8%", subtext: "Lineage score", icon: "fa-link", progress: 98 },
              { label: "HW Linkage", value: hwContext, subtext: "Constraint verification", icon: "fa-microchip", progress: 100 },
              { label: "Lineage Depth", value: "142", subtext: "Decision hops", icon: "fa-layer-group", progress: 82 }
            ]}
            telemetryFn={async (insights) => {
              const updatedInsights = await getProvenanceTelemetry(insights);
              handleUpdateProvenanceGraph();
              return updatedInsights;
            }}
            extraContent={() => (
              <div className="space-y-6">
                <QuantumGraph data={provenanceData} />
              </div>
            )}
          />
        );
      case 'green':
        return (
          <ModuleViewer 
            title="S-Score Metrics" 
            icon="fa-leaf" 
            color="emerald" 
            description="Implementing 'Strong Sustainability' metrics. Penalizing model size to reward efficiency on the Pareto Frontier."
            initialInsights={[
              { label: "Current S-Score", value: "0.92", subtext: "Final_Score = A * e^(-E/B)", icon: "fa-calculator", progress: 92 },
              { label: "Energy Intensity", value: "0.12μJ/T", subtext: "Baseline B: " + hwProfile.energyBaseline + "uJ", icon: "fa-bolt", progress: 96 },
              { label: "Carbon Trace", value: "0.08g/hr", subtext: "Emission rate", icon: "fa-cloud-sun", progress: 88 }
            ]}
            telemetryFn={getGreenTelemetry}
            extraContent={(insights) => <GreenParetoChart insights={insights} />}
          />
        );
      case 'quantum':
        return (
          <ModuleViewer 
            title="Quantum QEC" 
            icon="fa-atom" 
            color="violet" 
            description="Fault-shield monitoring within AgentBeats ecosystem."
            initialInsights={[
              { label: "Gate Fidelity", value: "99.982%", subtext: "Single-qubit gate", icon: "fa-crosshairs", progress: 99 },
              { label: "Coherence Stability", value: "84.5ms", subtext: "T2 dephasing", icon: "fa-wave-square", progress: 84 },
              { label: "Error Rate", value: "0.012%", subtext: "Cycle floor", icon: "fa-bug", progress: 12 }
            ]}
            telemetryFn={getQuantumTelemetry}
          />
        );
      case 'policy':
        return (
          <ModuleViewer 
            title="Policy Auditor" 
            icon="fa-file-shield" color="amber" 
            description="Independent verification of sustainability trade-offs on Gemini 3 Pro Thinking."
            initialInsights={[
              { label: "Policy Fidelity", value: "98.2%", subtext: "Alignment", icon: "fa-shield-check", progress: 98 },
              { label: "S-Score Compliance", value: "94.1%", subtext: "Efficiency floor", icon: "fa-chart-simple", progress: 94 },
              { label: "Memory Quota", value: "1.2GB", subtext: "Ceiling", icon: "fa-memory", progress: 45 }
            ]}
            extraContent={() => <PolicyAuditor />}
          />
        );
      case 'chaos':
        return (
          <ModuleViewer 
            title="Chaos Workbench" 
            icon="fa-fire-flame-curved" color="red" 
            description="Stress-test the cluster with hardware-aware anomalies analyzed by Gemini 3 Pro."
            initialInsights={[
              { label: "Anomaly Entropy", value: "0.002", subtext: "Clean signal", icon: "fa-wave-square", progress: 2 },
              { label: "HW Jitter", value: "4ms", subtext: "Clock stability", icon: "fa-stopwatch", progress: 8 },
              { label: "Adversarial Poke", value: "0.01%", subtext: "Safe", icon: "fa-user-ninja", progress: 1 }
            ]}
            extraContent={() => <ChaosSimulator />}
          />
        );
      default: return <Dashboard hwProfile={hwProfile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a]">
      <nav className="w-full md:w-64 bg-[#080808] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <i className="fa-solid fa-leaf text-xs text-white"></i>
            </div>
            <span className="font-black tracking-tighter text-lg uppercase italic">Green<span className="text-emerald-500">Agent</span></span>
          </div>
        </div>
        <div className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem icon="fa-chart-pie" label="Control Plane" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon="fa-network-wired" label="Carbon Supervisor" active={activeTab === 'orchestrator'} onClick={() => setActiveTab('orchestrator')} />
          <NavItem icon="fa-diagram-project" label="Graph Provenance" active={activeTab === 'provenance'} onClick={() => setActiveTab('provenance')} />
          <NavItem icon="fa-leaf" label="Strong Sustainability" active={activeTab === 'green'} onClick={() => setActiveTab('green')} />
          <NavItem icon="fa-atom" label="Quantum QEC" active={activeTab === 'quantum'} onClick={() => setActiveTab('quantum')} />
          <NavItem icon="fa-language" label="Global Mosaic" active={activeTab === 'mosaic'} onClick={() => setActiveTab('mosaic')} />
          <NavItem icon="fa-file-shield" label="Policy Auditor" active={activeTab === 'policy'} onClick={() => setActiveTab('policy')} />
          <NavItem icon="fa-fire-flame-curved" label="Chaos Workbench" active={activeTab === 'chaos'} onClick={() => setActiveTab('chaos')} />
        </div>
        <div className="p-4 border-t border-white/5 space-y-3">
           <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Edge_Benchmarking_Context</p>
           <HardwareSelector selected={hwContext} onChange={setHwContext} />
        </div>
      </nav>
      <main className="flex-grow overflow-y-auto bg-[#0a0a0a] relative">
        {renderContent()}
        <LiveAssistant />
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-lg shadow-emerald-500/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <i className={`fa-solid ${icon} w-6 text-center ${active ? 'text-emerald-500' : 'text-gray-500'}`}></i>
    <span className="font-black uppercase tracking-tighter italic">{label}</span>
  </button>
);

interface ModuleViewerProps {
  title: string;
  icon: string;
  color: string;
  description: string;
  initialInsights: Insight[];
  telemetryFn?: (insights: Insight[]) => Promise<any>;
  extraContent?: (insights: Insight[]) => React.ReactNode;
}

const ModuleViewer: React.FC<ModuleViewerProps> = ({ title, icon, color, description, initialInsights, telemetryFn, extraContent }) => {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTelemetry = async () => {
    if (!telemetryFn) return;
    setIsUpdating(true);
    try {
      const updatedData = await telemetryFn(insights);
      if (Array.isArray(updatedData)) {
        setInsights(prev => prev.map(oldInsight => {
          const match = updatedData.find(u => u.label === oldInsight.label);
          return match ? { ...oldInsight, ...match } : oldInsight;
        }));
      }
    } catch (error) {
      console.error("Telemetry update failed", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const colorStyles: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/10',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    red: 'text-red-400 border-red-500/20 bg-red-500/10',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10'
  };

  return (
    <div className="p-12 md:p-24 min-h-full space-y-16 animate-in fade-in">
       <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className={`w-32 h-32 rounded-[2.5rem] border-[3px] flex items-center justify-center text-5xl shadow-2xl ${colorStyles[color] || 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
              <i className={`fa-solid ${icon}`}></i>
            </div>
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <h1 className="text-6xl font-black text-white tracking-tighter leading-none italic uppercase">{title}</h1>
              <p className="text-xl text-gray-400 font-light leading-relaxed border-l-4 border-emerald-500/30 pl-8">{description}</p>
            </div>
          </div>
          
          {telemetryFn && (
            <button 
              onClick={handleTelemetry} 
              disabled={isUpdating}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-3 active:scale-95"
            >
              <i className={`fa-solid ${isUpdating ? 'fa-spinner fa-spin' : 'fa-bolt-lightning'}`}></i>
              {isUpdating ? 'Syncing...' : 'Update Telemetry'}
            </button>
          )}
       </div>

       {extraContent && (
         <div className="animate-in slide-in-from-bottom-8 duration-700">
           {extraContent(insights)}
         </div>
       )}
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-6 group hover:border-emerald-500/20 transition-all shadow-xl">
              <div className="flex justify-between items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-xl ${insight.progress > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                   <i className={`fa-solid ${insight.icon}`}></i>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">{insight.label}</span>
              </div>
              <div>
                <div className="text-5xl font-black text-white tracking-tighter mb-1">{insight.value}</div>
                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{insight.subtext}</div>
              </div>
              <div className="pt-4">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${insight.progress > 70 ? 'bg-emerald-500' : insight.progress > 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${insight.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default App;
