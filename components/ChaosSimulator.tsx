
import React, { useState, useEffect } from 'react';
import { simulateChaos } from '../services/geminiService';

const SCENARIOS = [
  { id: 'drift', label: 'Semantic Drift', icon: 'fa-wave-square', color: 'blue', desc: 'Vector misalignment and latent decay analysis.' },
  { id: 'surge', label: 'Energy Surge', icon: 'fa-bolt-lightning', color: 'amber', desc: 'Power spike simulations for architectural pruning.' },
  { id: 'adversarial', label: 'Adversarial Poke', icon: 'fa-user-ninja', color: 'red', desc: 'Gradient poisoning and prompt injection testing.' },
  { id: 'qubit', label: 'Decoherence', icon: 'fa-atom', color: 'violet', desc: 'QEC gate failure and quantum stability flux.' }
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
      setStressLevel(prev => Math.min(100, prev + 8));
    }, 150);

    try {
      const res = await simulateChaos(scenarioId, { 
        latency: 120 + (stressLevel * 3), 
        energy: 0.5 + (stressLevel / 40), 
        efficiency: liveMetrics.efficiency
      });
      // Simple sanitization to remove common markdown marks if they still appear
      const sanitized = res.replace(/[#*_]/g, '');
      setReport(sanitized);
    } finally {
      clearInterval(ramp);
      setIsSimulating(false);
      setStressLevel(0);
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

      <div className={`bg-[#080808] border rounded-[3rem] p-12 min-h-[550px] shadow-2xl relative overflow-hidden transition-all duration-500 ${isSimulating ? 'border-red-500/30 shadow-red-500/10' : 'border-white/5'}`}>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
           <div className="space-y-2">
             <div className="flex items-center gap-3">
               <h3 className={`text-sm font-black uppercase tracking-[0.3em] transition-colors ${isSimulating ? 'text-red-500' : 'text-gray-400'}`}>
                 Chaos_Core_Analytical_Interface
               </h3>
               {isSimulating && <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded animate-pulse">SIMULATION_LIVE</span>}
             </div>
             <p className="text-[11px] text-gray-600 font-mono flex items-center gap-2 italic">
               <i className="fa-solid fa-microchip text-[8px]"></i>
               Analysis Mode: Structural Intelligence Audit
             </p>
           </div>
           
           <div className="flex gap-12">
              <MetricMini label="Entropy" val={liveMetrics.entropy.toFixed(4)} drift={isSimulating ? `+${(stressLevel/10).toFixed(1)}%` : "STABLE"} color={isSimulating ? 'red' : 'gray'} />
              <MetricMini label="Core_Jitter" val={`${liveMetrics.jitter.toFixed(1)}ms`} drift={isSimulating ? `+${(stressLevel/4).toFixed(1)}%` : "STABLE"} color={isSimulating ? 'red' : 'gray'} />
              <MetricMini label="System_Health" val={`${liveMetrics.efficiency.toFixed(1)}%`} drift={isSimulating ? `-${(stressLevel/15).toFixed(1)}%` : "STABLE"} color={isSimulating ? 'red' : 'gray'} />
           </div>
        </div>

        {report ? (
          <div className="space-y-10 animate-in slide-in-from-top-4 relative z-10">
             <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] relative overflow-hidden group shadow-inner">
                <div className="flex items-center gap-6 mb-10 border-b border-white/5 pb-6">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl">
                      <i className="fa-solid fa-file-invoice"></i>
                   </div>
                   <div>
                     <h4 className="text-[14px] font-black text-white uppercase tracking-[0.2em] italic font-mono">
                       Structural Stress Test Post-Mortem
                     </h4>
                     <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">Generated by Gemini 3 Pro // Thinking Core</p>
                   </div>
                </div>
                
                {/* Well-Text Output Area */}
                <div className="text-[14px] text-gray-300 leading-[1.8] font-serif whitespace-pre-wrap max-w-5xl mx-auto selection:bg-emerald-500/30">
                  {report}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
                <InsightCard label="Green Utility Impact" val="Moderate Decay" sub="Ug Floor -12.4%" color="blue" />
                <InsightCard label="Architectural Drift" val="Vector Shift Detected" sub="Centroid Delta: 0.042" color="amber" />
                <InsightCard label="Carbon Penalty" val="Scope 3 Spike" sub="+0.082g Threshold" color="red" />
             </div>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center h-[350px] transition-opacity duration-300 relative z-10 ${isSimulating ? 'opacity-80' : 'opacity-10'}`}>
             <div className={`w-36 h-36 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center ${isSimulating ? 'animate-spin' : 'animate-spin-slow'}`}>
                <i className={`fa-solid ${isSimulating ? 'fa-bolt-lightning fa-beat' : 'fa-brain-circuit'} text-5xl ${isSimulating ? 'text-red-500' : 'text-gray-500'}`}></i>
             </div>
             <div className="mt-10 text-center space-y-3">
               <p className="text-[12px] uppercase tracking-[0.6em] font-black text-gray-400">
                 {isSimulating ? 'AUDITING ARCHITECTURAL RESILIENCE' : 'INITIATE STRESS TEST SEQUENCE'}
               </p>
               {isSimulating && (
                 <div className="w-80 h-1 bg-white/5 rounded-full mt-6 overflow-hidden mx-auto">
                   <div className="h-full bg-red-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
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
    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline gap-4">
      <span className={`text-[10px] font-bold ${drift === 'STABLE' ? 'text-emerald-500' : 'text-red-500'} italic font-mono`}>{drift}</span>
      <span className="text-3xl font-black text-white font-mono tracking-tighter">{val}</span>
    </div>
  </div>
);

const InsightCard: React.FC<{ label: string; val: string; sub: string; color: string }> = ({ label, val, sub, color }) => {
  const colors: any = { blue: 'text-blue-400 border-blue-400/10 bg-blue-400/5', amber: 'text-amber-400 border-amber-400/10 bg-amber-400/5', red: 'text-red-400 border-red-400/10 bg-red-400/5' };
  return (
    <div className={`p-8 rounded-[2rem] border ${colors[color]} flex flex-col gap-2 shadow-xl`}>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-black text-white uppercase tracking-tight">{val}</span>
      <span className="text-[11px] font-mono text-gray-600">{sub}</span>
    </div>
  );
};

export default ChaosSimulator;
