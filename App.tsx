
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from './services/geminiService';
import { QuantumGraphData, HardwareType } from './types';
import { HARDWARE_PROFILES, MOCK_AGENTS } from './constants';

type TabType = 'dashboard' | 'orchestrator' | 'policy' | 'chaos' | 'quantum' | 'green' | 'provenance' | 'mosaic';

interface Insight {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  progress: number;
}

/**
 * ModuleViewer component to wrap each dashboard section with common UI elements and telemetry.
 */
const ModuleViewer: React.FC<{
  title: string;
  icon: string;
  color: string;
  description: string;
  initialInsights: Insight[];
  telemetryFn?: (insights: Insight[]) => Promise<Insight[]>;
  extraContent?: () => React.ReactNode;
}> = ({ title, icon, color, description, initialInsights, telemetryFn, extraContent }) => {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    if (!telemetryFn) return;
    setIsSyncing(true);
    try {
      const updated = await telemetryFn(insights);
      if (updated) setInsights(updated);
    } catch (err) {
      console.error("Telemetry sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [telemetryFn, insights]);

  useEffect(() => {
    if (telemetryFn) {
      const interval = setInterval(handleSync, 15000);
      return () => clearInterval(interval);
    }
  }, [telemetryFn, handleSync]);

  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    red: 'text-red-400 border-red-500/20 bg-red-500/5',
  };

  const progressColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-1000 max-w-[1600px] mx-auto pb-24">
      <div className={`p-10 rounded-[3rem] border ${colorClasses[color]} relative overflow-hidden group shadow-2xl`}>
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <i className={`fa-solid ${icon} text-[10rem]`}></i>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] font-mono italic">{title.replace(' ', '_')}</h2>
            {telemetryFn && <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></div>}
          </div>
          <p className="text-3xl font-black text-white tracking-tighter max-w-2xl leading-tight">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{insight.label}</div>
                <div className="text-3xl font-black text-white tracking-tighter">{insight.value}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                <i className={`fa-solid ${insight.icon}`}></i>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${progressColors[color]} transition-all duration-1000`} style={{ width: `${insight.progress}%` }}></div>
              </div>
              <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">{insight.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      {extraContent && extraContent()}
    </div>
  );
};

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
    try {
      const newData = await getGraphTelemetry('provenance');
      if (newData && Array.isArray(newData.nodes) && newData.nodes.length > 0) {
        setProvenanceData(newData);
      }
    } catch (err) {
      console.error("Failed to update provenance graph", err);
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
            extraContent={() => <GreenParetoChart agents={MOCK_AGENTS} selectedAgentId={MOCK_AGENTS[0].id} />}
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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      <nav className="sticky top-0 z-[100] bg-[#050505]/80 backdrop-blur-3xl border-b border-white/5 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            <i className="fa-solid fa-bolt-lightning"></i>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.3em] font-mono italic">AgentBeats<span className="text-emerald-500">.Green</span></h1>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sustainability Protocol v3.1</span>
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Global Node: Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full custom-scrollbar">
          {(['dashboard', 'orchestrator', 'mosaic', 'provenance', 'green', 'quantum', 'policy', 'chaos'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <HardwareSelector selected={hwContext} onChange={setHwContext} />
      </nav>

      <main>
        {renderContent()}
      </main>

      <LiveAssistant />
    </div>
  );
};

export default App;
