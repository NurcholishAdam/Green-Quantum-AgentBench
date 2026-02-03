
import React, { useState, useEffect } from 'react';
import { simulateChaos } from '../services/geminiService';

const SCENARIOS = [
  { id: 'drift', label: 'Semantic Drift', icon: 'fa-wave-square', color: 'blue', desc: 'Vector misalignment stress on latent space embeddings.' },
  { id: 'surge', label: 'Energy Surge', icon: 'fa-bolt-lightning', color: 'amber', desc: 'Simulate power spikes forcing architectural pruning.' },
  { id: 'adversarial', label: 'Adversarial Poke', icon: 'fa-user-ninja', color: 'red', desc: 'Gradient poisoning and prompt injection stability test.' },
  { id: 'qubit', label: 'Decoherence Flux', icon: 'fa-atom', color: 'violet', desc: 'Simulate QEC gate failure in quantum clusters.' }
];

const ChaosSimulator: React.FC = () => {
  const [report, setReport] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({ entropy: 0.002, jitter: 4, efficiency: 98 });

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setLiveMetrics(prev => ({
          entropy: prev.entropy + (Math.random() * 0.1 * (stressLevel / 100)),
          jitter: prev.jitter + (Math.random() * 20 * (stressLevel / 100)),
          efficiency: Math.max(0, prev.efficiency - (Math.random() * 2 * (stressLevel / 100)))
        }));
      }, 100);
    } else {
      setLiveMetrics({ entropy: 0.002, jitter: 4, efficiency: 98 });
    }
    return () => clearInterval(interval);
  }, [isSimulating, stressLevel]);

  const handleSimulate = async (scenarioId: string) => {
    setIsSimulating(true);
    setActiveScenario(scenarioId);
    setStressLevel(30);
    setReport(null);
    
    const ramp = setInterval(() => {
      setStressLevel(prev => Math.min(100, prev + 10));
    }, 150);

    try {
      const res = await simulateChaos(scenarioId, { 
        latency: 150 + (stressLevel * 2), 
        energy: 0.8 + (stressLevel / 50), 
        carbon: 0.12 + (stressLevel / 100) 
      });
      setReport(res);
    } finally {
      clearInterval(ramp);
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-12 mt-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSimulate(s.id)}
            disabled={isSimulating}
            className={`p-8 rounded-[2.5rem] border transition-all group flex flex-col items-start gap-4 text-left relative overflow-hidden ${
              activeScenario === s.id ? 'bg-white/10 border-white/20 scale-105 shadow-2xl' : 'bg-[#0d0d0d] border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-white/5 text-${s.color}-400 group-hover:scale-110 transition-transform relative z-10`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-emerald-400 block mb-1">{s.label}</span>
              <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{s.desc}</p>
            </div>
            {activeScenario === s.id && isSimulating && (
              <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
            )}
          </button>
        ))}
      </div>

      <div className={`bg-[#080808] border rounded-[3rem] p-12 min-h-[500px] shadow-2xl relative overflow-hidden transition-all duration-500 ${isSimulating ? 'border-red-500/30 shadow-red-500/10' : 'border-white/5'}`}>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
               <h3 className={`text-sm font-black uppercase tracking-[0.3em] transition-colors ${isSimulating ? 'text-red-500' : 'text-gray-400'}`}>
                 Stress_Test_Simulation_Core
               </h3>
               {isSimulating && <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded animate-pulse">UNDER_LOAD</span>}
             </div>
             <p className="text-[11px] text-gray-600 font-mono flex items-center gap-2 italic">
               <i className="fa-solid fa-microchip text-[8px]"></i>
               Adaptive_Stress_Response: ACTIVE
             </p>
           </div>
           
           <div className="flex gap-12">
              <MetricMini label="Entropy_Flux" val={liveMetrics.entropy.toFixed(4)} drift={isSimulating ? `+${(stressLevel/10).toFixed(1)}%` : "STABLE"} color={isSimulating ? 'red' : 'gray'} />
              <MetricMini label="Jitter_MS" val={`${liveMetrics.jitter.toFixed(1)}`} drift={isSimulating ? `+${(stressLevel/5).toFixed(1)}%` : "STABLE"} color={isSimulating ? 'red' : 'gray'} />
              <MetricMini label="Core_Efficiency" val={`${liveMetrics.efficiency.toFixed(1)}%`} drift={isSimulating ? `-${(stressLevel/15).toFixed(1)}%` : "STABLE"} color={isSimulating ? 'red' : 'gray'} />
           </div>
        </div>

        {report ? (
          <div className="space-y-8 animate-in slide-in-from-top-4 relative z-10">
             <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-inner">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                   </div>
                   <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic font-mono">
                     Post-Mortem Analysis (Pro_Thinking_Core)
                   </h4>
                </div>
                <div className="text-[13px] text-gray-400 leading-relaxed font-serif italic whitespace-pre-wrap border-l-2 border-emerald-500/20 pl-8 py-2 max-w-4xl">
                  {report}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                   <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Utility_Impact_Report</h5>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                         <span>Ug_Metric_Volatility</span>
                         <span className="font-mono text-blue-400">HIGH_RISK</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                         <span>Architectural_Debt_Spike</span>
                         <span className="font-mono text-blue-400">+14.2%</span>
                      </div>
                   </div>
                </div>
                <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                   <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">Carbon_Credit_Trading_Flux</h5>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                         <span>Trading_Frequency</span>
                         <span className="font-mono text-amber-500">0.82Hz</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                         <span>Equilibrium_Threshold</span>
                         <span className="font-mono text-amber-500">DEGRADED</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center h-80 transition-opacity duration-300 relative z-10 ${isSimulating ? 'opacity-80' : 'opacity-10'}`}>
             <div className={`w-32 h-32 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center ${isSimulating ? 'animate-spin' : 'animate-spin-slow'}`}>
                <i className={`fa-solid ${isSimulating ? 'fa-radiation fa-spin' : 'fa-skull-crossbones'} text-4xl text-red-500`}></i>
             </div>
             <div className="mt-8 text-center space-y-2">
               <p className="text-[11px] uppercase tracking-[0.5em] font-black text-gray-400">
                 {isSimulating ? 'ANALYZING_STRESS_VECTORS...' : 'SELECT_SCENARIO_TO_STRESS_TEST'}
               </p>
               {isSimulating && (
                 <div className="w-64 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-red-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                 </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricMini: React.FC<{ label: string; val: string; drift: string; color: string }> = ({ label, val, drift, color }) => (
  <div className="flex flex-col items-end">
    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline gap-3">
      <span className={`text-[10px] font-bold ${drift === 'STABLE' ? 'text-emerald-500' : 'text-red-500'} italic`}>{drift}</span>
      <span className="text-2xl font-black text-white font-mono tracking-tighter">{val}</span>
    </div>
  </div>
);

export default ChaosSimulator;
