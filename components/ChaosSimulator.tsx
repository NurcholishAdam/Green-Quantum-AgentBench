
import React, { useState } from 'react';
import { simulateChaos } from '../services/geminiService';

const SCENARIOS = [
  { id: 'drift', label: 'Semantic Drift', icon: 'fa-wave-square', color: 'blue' },
  { id: 'qubit', label: 'Qubit Decay', icon: 'fa-atom', color: 'violet' },
  { id: 'energy', label: 'Energy Surge', icon: 'fa-bolt-lightning', color: 'amber' },
  { id: 'adversarial', label: 'Adversarial Poke', icon: 'fa-user-ninja', color: 'red' }
];

const ChaosSimulator: React.FC = () => {
  const [report, setReport] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const handleSimulate = async (scenarioId: string) => {
    setIsSimulating(true);
    setActiveScenario(scenarioId);
    setReport(null);
    try {
      const res = await simulateChaos(scenarioId, { latency: 150, energy: 0.8, carbon: 0.12 });
      setReport(res);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-12 mt-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSimulate(s.id)}
            disabled={isSimulating}
            className={`p-8 rounded-[2rem] border transition-all group flex flex-col items-center gap-4 ${
              activeScenario === s.id ? 'bg-white/10 border-white/20 scale-105' : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-white/5 text-${s.color}-400 group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-10 min-h-[400px] shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
             <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">Stress_Test_Simulation_Core</h3>
             <p className="text-[11px] text-gray-600 font-mono">Live_Metrics_Buffer_Active</p>
           </div>
           {isSimulating && <div className="flex h-3 w-3 rounded-full bg-red-500 animate-ping"></div>}
        </div>

        {report ? (
          <div className="space-y-6 animate-in slide-in-from-top-4">
             <div className="grid grid-cols-3 gap-6">
                <MetricMini label="Entropy" val="0.84" drift="+12%" />
                <MetricMini label="Decay" val="4.2ms" drift="+4%" />
                <MetricMini label="Efficiency" val="62%" drift="-18%" />
             </div>
             <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl">
                <div className="text-[12px] text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {report}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 opacity-10 space-y-4">
             <i className="fa-solid fa-skull-crossbones text-6xl"></i>
             <p className="text-[9px] uppercase tracking-[0.5em] text-center">Select Stress Scenario to Initialize Simulation</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricMini: React.FC<{ label: string; val: string; drift: string }> = ({ label, val, drift }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
    <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline justify-between">
      <span className="text-xl font-black text-white">{val}</span>
      <span className="text-[9px] font-bold text-red-500">{drift}</span>
    </div>
  </div>
);

export default ChaosSimulator;
