
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import { MOCK_AGENTS } from './constants';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'quantum':
        return (
          <ModulePlaceholder 
            title="Quantum Simulation Modules" 
            icon="fa-microchip" 
            color="violet" 
            description="Benchmarking quantum gate fidelity and coherence stability across high-reasoning agent kernels."
            insights={[
              { label: "Gate Fidelity", value: "99.98%", subtext: "Sycamore-class precision", icon: "fa-crosshairs", progress: 99 },
              { label: "Coherence (T2)", value: "140μs", subtext: "Stable-state duration", icon: "fa-wave-square", progress: 85 },
              { label: "Connectivity", value: "12-way", subtext: "High Entanglement Mesh", icon: "fa-diagram-project", progress: 70 }
            ]}
          />
        );
      case 'green':
        return (
          <ModulePlaceholder 
            title="Green Energy Metrics" 
            icon="fa-leaf" 
            color="emerald" 
            description="Analyzing micro-joule per token efficiency and carbon-neutral compute cycles."
            insights={[
              { label: "Energy Delta", value: "-42%", subtext: "Reduction vs Baseline", icon: "fa-arrow-down", progress: 92 },
              { label: "Carbon Offset", value: "1.2kg/hr", subtext: "Compute Load Recovery", icon: "fa-cloud-sun", progress: 65 },
              { label: "Compute Intensity", value: "0.2W/T", subtext: "Sub-Watt Token Profile", icon: "fa-bolt", progress: 88 }
            ]}
          />
        );
      case 'multilingual':
        return (
          <ModulePlaceholder 
            title="Multilingual Benchmarks" 
            icon="fa-language" 
            color="blue" 
            description="Evaluation of cross-lingual performance across 50+ high-entropy languages."
            insights={[
              { label: "Lang Coverage", value: "124 ISOs", subtext: "Low-resource focus", icon: "fa-earth-africa", progress: 82 },
              { label: "BLEU Median", value: "48.2", subtext: "High-Fidelity Avg", icon: "fa-spell-check", progress: 75 },
              { label: "Script Divergence", value: "Low", subtext: "12 Major Script Systems", icon: "fa-keyboard", progress: 95 }
            ]}
          />
        );
      case 'qlgraph':
        return (
          <ModulePlaceholder 
            title="QL-Graph Provenance" 
            icon="fa-network-wired" 
            color="blue" 
            description="Visualizing the high-fidelity lineage of agent decisions via Quantum-Limit Graph nodes."
            insights={[
              { label: "Node Density", value: "0.84", subtext: "Connectivity index", icon: "fa-circle-nodes", progress: 84 },
              { label: "Mean Path", value: "2.4", subtext: "Step-wise decision depth", icon: "fa-route", progress: 60 },
              { label: "Entropy Sync", value: "0.12b", subtext: "Low Uncertainty rating", icon: "fa-fingerprint", progress: 90 }
            ]}
          />
        );
      case 'error':
        return (
          <ModulePlaceholder 
            title="Quantum Error Correction" 
            icon="fa-shield-halved" 
            color="red" 
            description="Benchmarking Surface Code and Steane Code resilience in agentic reasoning loops."
            insights={[
              { label: "Syndrome Rate", value: "2.1%", subtext: "Surface Code Detection", icon: "fa-bug-slash", progress: 15 },
              { label: "Recovery Success", value: "99.4%", subtext: "Fault Tolerance Met", icon: "fa-heart-pulse", progress: 99 },
              { label: "Code Distance", value: "d=7", subtext: "Topological Protection", icon: "fa-cube", progress: 70 }
            ]}
          />
        );
      case 'dataset':
        return (
          <ModulePlaceholder 
            title="Dataset Explorer" 
            icon="fa-database" 
            color="amber" 
            description="Exploring the synchronized Green Agent dataset and real-time standardization indices."
            insights={[
              { label: "Total Samples", value: "1.2M", subtext: "Synchronized entries", icon: "fa-folder-tree", progress: 100 },
              { label: "Update Sync", value: "2m ago", subtext: "Real-time Node- GA-X7", icon: "fa-sync", progress: 98 },
              { label: "A2A Integrity", value: "100%", subtext: "Compliance Schema Valid", icon: "fa-file-signature", progress: 100 }
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
          <NavItem 
            icon="fa-chart-pie" 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon="fa-microchip" 
            label="Quantum Modules" 
            active={activeTab === 'quantum'} 
            onClick={() => setActiveTab('quantum')} 
          />
          <NavItem 
            icon="fa-leaf" 
            label="Green Metrics" 
            active={activeTab === 'green'} 
            onClick={() => setActiveTab('green')} 
          />
          <NavItem 
            icon="fa-language" 
            label="Multilingual Bench" 
            active={activeTab === 'multilingual'} 
            onClick={() => setActiveTab('multilingual')} 
          />
          
          <div className="pt-8 px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Infrastructure</div>
          <NavItem 
            icon="fa-network-wired" 
            label="QL-Graph Prov" 
            active={activeTab === 'qlgraph'} 
            onClick={() => setActiveTab('qlgraph')} 
          />
          <NavItem 
            icon="fa-shield-halved" 
            label="Error Correction" 
            active={activeTab === 'error'} 
            onClick={() => setActiveTab('error')} 
          />
          <NavItem 
            icon="fa-database" 
            label="Dataset Explorer" 
            active={activeTab === 'dataset'} 
            onClick={() => setActiveTab('dataset')} 
          />
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 overflow-hidden">
               <img src="https://picsum.photos/100/100" alt="Avatar" />
            </div>
            <div>
              <p className="text-xs font-bold">Research_Node</p>
              <p className="text-[10px] text-emerald-500 font-mono">ID: GA-X7</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto bg-[#0a0a0a] relative">
        {renderContent()}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 group ${
      active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <i className={`fa-solid ${icon} w-5 text-center transition-transform group-hover:scale-110 ${active ? 'text-emerald-500' : 'text-gray-500'}`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

const ModulePlaceholder: React.FC<{ title: string, icon: string, color: string, description: string, insights: Insight[] }> = ({ title, icon, color, description, insights }) => {
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

  return (
    <div className="p-8 md:p-12 min-h-full flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center space-y-6">
        <div className={`w-24 h-24 mx-auto rounded-3xl border flex items-center justify-center text-4xl shadow-2xl ${colorMap[color] || colorMap.blue}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            {title}
          </h1>
          <p className="text-gray-400 font-light leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {insights.map((insight, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-3xl space-y-6 hover:border-white/10 transition-all hover:-translate-y-1 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]} bg-opacity-5`}>
                <i className={`fa-solid ${insight.icon} text-lg`}></i>
              </div>
              <span className="text-xs font-mono text-gray-500">INSIGHT_NODE_{i+1}</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{insight.label}</h3>
              <p className="text-3xl font-bold text-white tracking-tight">{insight.value}</p>
              <p className="text-[10px] text-gray-400 font-light italic">{insight.subtext}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-gray-600">
                <span>Confidence Level</span>
                <span>{insight.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${progressColor[color]} transition-all duration-1000`} 
                  style={{ width: `${insight.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2">
          <i className="fa-solid fa-file-export"></i>
          Module Analysis
        </button>
        <button className={`px-8 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 shadow-lg ${color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-violet-600 hover:bg-violet-500'} text-white`}>
          <i className="fa-solid fa-play"></i>
          Trigger Refresh
        </button>
      </div>
    </div>
  );
};

export default App;
