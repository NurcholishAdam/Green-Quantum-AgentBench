import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, HardwareProfile, GridContext } from '../types';
import QuantumGraph from './QuantumGraph';
import GreenParetoChart from './GreenParetoChart';
import { 
  getChaosNotice, 
  calculateSScore,
  calculateUGScore,
  calculateEEff,
  getRegionalCarbonIntensity
} from '../services/geminiService';

interface Props {
  hwProfile: HardwareProfile;
}

const Dashboard: React.FC<Props> = ({ hwProfile }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [gridData, setGridData] = useState<GridContext | null>(null);
  const [chaosNotice, setChaosNotice] = useState<string | null>(null);
  const [cumulativeSavings, setCumulativeSavings] = useState<number>(0);

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

  // Sustainability Pareto & Efficiency Calculations for selected agent
  const sScore = useMemo(() => {
    return calculateSScore(selectedAgent.greenScore, selectedAgent.energyPerToken, hwProfile.energyBaseline);
  }, [selectedAgent, hwProfile]);

  const uG = useMemo(() => {
    return calculateUGScore(selectedAgent.greenScore, selectedAgent.energyPerToken, selectedAgent.latency);
  }, [selectedAgent]);

  const quantumEffMetric = useMemo(() => {
    return calculateEEff(selectedAgent.greenScore, selectedAgent.energyPerToken);
  }, [selectedAgent]);

  // Live Grid Intensity Protocol
  useEffect(() => {
    const fetchGrid = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const data = await getRegionalCarbonIntensity(pos.coords.latitude, pos.coords.longitude);
          setGridData(data);
        }, async () => {
          const data = await getRegionalCarbonIntensity();
          setGridData(data);
        });
      } else {
        const data = await getRegionalCarbonIntensity();
        setGridData(data);
      }
    };
    fetchGrid();
    const interval = setInterval(fetchGrid, 60000);
    return () => clearInterval(interval);
  }, []);

  // Marginal Savings Audit
  const legacyFootprint = useMemo(() => selectedAgent.carbonIntensity * 2.85, [selectedAgent]);
  const savingsGrams = useMemo(() => legacyFootprint - selectedAgent.carbonIntensity, [legacyFootprint, selectedAgent]);
  const avoidanceRate = useMemo(() => (savingsGrams / legacyFootprint) * 100, [savingsGrams, legacyFootprint]);

  useEffect(() => {
    const monitorChaos = async () => {
      const notice = await getChaosNotice(selectedAgent);
      setChaosNotice(notice);
      // Simulate cumulative savings growth as user monitors agents
      setCumulativeSavings(prev => prev + (savingsGrams * 0.1));
    };
    monitorChaos();
  }, [selectedAgent, savingsGrams]);

  const radarData = useMemo(() => [
    { subject: 'Latency', A: (1 - selectedAgent.latency / 500) * 100 },
    { subject: 'Energy', A: (1 - selectedAgent.energyPerToken) * 100 },
    { subject: 'Carbon', A: (1 - selectedAgent.carbonIntensity) * 100 },
    { subject: 'Memory', A: selectedAgent.memoryEfficiency },
    { subject: 'Ug Utility', A: uG },
    { subject: 'E-Eff', A: quantumEffMetric * 10 }, 
  ], [selectedAgent, uG, quantumEffMetric]);

  return (
    <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-1000 max-w-[1600px] mx-auto pb-24">
      
      {/* Live Grid Reactive Pulse & Avoidance Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-top-10">
         <div className="lg:col-span-8 bg-gradient-to-br from-[#0d0d0d] via-[#111] to-[#0d0d0d] border border-emerald-500/20 p-10 rounded-[3rem] flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
               <i className="fa-solid fa-bolt text-[12rem] text-emerald-500"></i>
            </div>
            <div className="flex items-center gap-10 relative z-10">
               <div className="w-24 h-24 rounded-[2.2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-5xl text-emerald-500 shadow-xl shadow-emerald-500/5">
                  <i className="fa-solid fa-leaf-heart"></i>
               </div>
               <div className="space-y-2">
                  <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.5em] font-mono italic">Regional_Grid_Reactive_Audit</h2>
                  <p className="text-4xl font-black text-white tracking-tighter max-w-lg leading-tight">
                    Net Carbon Saved: <span className="text-emerald-500">{cumulativeSavings.toFixed(2)}g</span>
                  </p>
                  <div className="flex items-center gap-8 pt-3">
                     <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500/60 uppercase font-mono">
                        <i className="fa-solid fa-shield-check"></i> {avoidanceRate.toFixed(1)}% Gain vs. Legacy
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-black text-blue-500/60 uppercase font-mono">
                        <i className="fa-solid fa-earth-americas"></i> {gridData?.region || 'Detecting Grid...'}
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="hidden xl:block text-right pr-4 relative z-10">
               <div className="text-[10px] font-black text-gray-700 uppercase mb-2 tracking-widest italic">Live_Intensity</div>
               <div className={`text-4xl font-black font-mono tracking-tighter ${gridData?.status === 'Dirty' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {gridData?.intensity || '---'}
                  <span className="text-xs ml-1 opacity-40">g/kWh</span>
               </div>
               <div className="text-[8px] font-mono text-gray-500 mt-1 uppercase">Grid_Status: {gridData?.status || 'Searching...'}</div>
            </div>
         </div>
         
         <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/5 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center shadow-xl group hover:border-emerald-500/20 transition-all">
            <div className="text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-emerald-500 transition-colors">{quantumEffMetric.toFixed(2)}</div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic">{"Quantum_E_Eff Metric ($E_{eff}$)"}</div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-2 shadow-inner">
               <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" style={{ width: `${Math.min(100, quantumEffMetric * 8)}%` }}></div>
            </div>
            <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">Task Ratio / Energy Per Bit</p>
         </div>
      </div>

      {/* Comparative "Shadow" Benchmark Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0d0d0d] border border-red-500/10 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fa-solid fa-ghost text-6xl text-red-500"></i>
          </div>
          <div className="space-y-6">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest font-mono italic">Shadow_Legacy_Baseline</div>
            <h3 className="text-2xl font-black text-white tracking-tight">Standard Agent</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-[9px] text-gray-600 uppercase font-black">Energy Intensity</div>
                <div className="text-xl font-mono font-bold text-red-400">{(selectedAgent.energyPerToken * 2.5).toFixed(2)} μJ</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-gray-600 uppercase font-black">Latency</div>
                <div className="text-xl font-mono font-bold text-red-400">{(selectedAgent.latency * 1.8).toFixed(0)} ms</div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="text-[9px] text-gray-500 italic">"Unoptimized H100 cluster without carbon-aware pruning."</div>
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fa-solid fa-leaf text-6xl text-emerald-500"></i>
          </div>
          <div className="space-y-6">
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono italic">Green_Optimized_Node</div>
            <h3 className="text-2xl font-black text-white tracking-tight">Your Green Agent</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-[9px] text-gray-600 uppercase font-black">Energy Intensity</div>
                <div className="text-xl font-mono font-bold text-emerald-400">{selectedAgent.energyPerToken.toFixed(2)} μJ</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-gray-600 uppercase font-black">Latency</div>
                <div className="text-xl font-mono font-bold text-emerald-400">{selectedAgent.latency} ms</div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <div className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                Carbon-Aware Pruning Enabled
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#0d0d0d] border border-white/5 p-10 rounded-[2.5rem] shadow-xl">
             <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-10 border-b border-white/5 pb-4 italic">Benchmarking_Radar</h3>
             <ResponsiveContainer width="100%" height={260}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 9, fontWeight: 'bold' }} />
                  <Radar name={selectedAgent.name} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <MetricBox label="Latency" val={`${selectedAgent.latency}ms`} color="blue" />
             <MetricBox label="Energy" val={`${selectedAgent.energyPerToken}μJ`} color="emerald" />
             <MetricBox label="Carbon" val={`${selectedAgent.carbonIntensity}g`} color="amber" />
             <MetricBox label="Memory" val={`${selectedAgent.memoryEfficiency}%`} color="violet" />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-8">
          {/* Sustainability Pareto Frontier Chart */}
          <div className="bg-[#080808] border border-white/5 p-10 rounded-[3rem] shadow-2xl overflow-hidden group">
             <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-4 italic mb-10 px-4">
                <i className="fa-solid fa-chart-line text-emerald-500"></i>
                Sustainability_Pareto_Frontier_v3
             </h3>
             <GreenParetoChart agents={MOCK_AGENTS} selectedAgentId={selectedAgentId} />
          </div>
          
          <QuantumGraph data={{
            nodes: [
              { id: 'hw', label: hwProfile.type, type: 'hardware', val: 100 },
              { id: 'uG', label: 'Green Utility', type: 'policy', val: uG },
              { id: 'sav', label: 'Avoidance Ledger', type: 'provenance', val: avoidanceRate },
              { id: 'a1', label: selectedAgent.name, type: 'agent', val: selectedAgent.greenScore }
            ],
            links: [
              { source: 'hw', target: 'a1', weight: 35 },
              { source: 'a1', target: 'uG', weight: 45 },
              { source: 'uG', target: 'sav', weight: 55 }
            ]
          }} />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#0d0d0d] border border-white/5 p-10 rounded-[3rem] shadow-xl h-full flex flex-col relative overflow-hidden">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-8 flex justify-between items-center italic">
              Value_of_Green_Index
              <i className="fa-solid fa-coins text-amber-500/30"></i>
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-10 pt-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <div className="text-[11px] font-black text-gray-500 uppercase">Carbon_Saved</div>
                     <div className="text-[10px] font-mono text-emerald-500">LIVE</div>
                  </div>
                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] group hover:bg-emerald-500/10 transition-all text-center shadow-inner">
                     <div className="text-5xl font-black text-white tracking-tighter">-{savingsGrams.toFixed(3)}g</div>
                     <p className="text-[10px] text-gray-600 mt-3 italic font-serif leading-tight">"Marginal avoidance vs standard unoptimized H100 benchmarks."</p>
                  </div>
               </div>

               <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] space-y-5">
                  <div className="text-[11px] font-black text-blue-500 uppercase flex items-center gap-3">
                    <i className="fa-solid fa-ghost"></i>
                    Shadow_Cost_Audit
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                     <span>Legacy Baseline</span>
                     <span className="font-mono text-gray-400">{legacyFootprint.toFixed(2)}g</span>
                  </div>
               </div>

               <div className="pt-8 border-t border-white/5 space-y-5">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                     <i className="fa-solid fa-leaf text-emerald-500"></i>
                     Trees_Offset: 0.24/Day
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                     <i className="fa-solid fa-plug-circle-bolt text-blue-500"></i>
                     Grid_Relief: {gridData?.status === 'Dirty' ? 'CRITICAL' : 'OPTIMAL'}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-white/5 p-12 rounded-[3.5rem] shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-white/10 pb-8 gap-6">
           <div className="space-y-2 text-center md:text-left">
             <h3 className="text-lg font-black text-white uppercase tracking-[0.4em] font-mono italic">Agent_Efficiency_Matrix</h3>
             <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest italic">{"Sorted by Quantum Energy-per-Bit ($E_{eff}$)"}</p>
           </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-6 px-8 text-[11px] font-black text-gray-700 uppercase tracking-widest">Agent_Entity</th>
                <th className="py-6 px-8 text-[11px] font-black text-blue-500 uppercase tracking-widest text-center">E_Eff Metric</th>
                <th className="py-6 px-8 text-[11px] font-black text-emerald-500 uppercase tracking-widest text-center">S-Score</th>
                <th className="py-6 px-8 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">HW Baseline</th>
                <th className="py-6 px-8 text-[11px] font-black text-emerald-500 uppercase tracking-widest text-center">Marginal_Savings</th>
                <th className="py-6 px-8 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Utility (Ug)</th>
                <th className="py-6 px-8 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">QEC_Fidelity</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AGENTS.map((agent) => {
                const currentUg = calculateUGScore(agent.greenScore, agent.energyPerToken, agent.latency);
                const agentEffMetric = calculateEEff(agent.greenScore, agent.energyPerToken);
                const agentSScore = calculateSScore(agent.greenScore, agent.energyPerToken, hwProfile.energyBaseline);
                const isSelected = agent.id === selectedAgentId;
                const mSavings = (agent.carbonIntensity * 2.85) - agent.carbonIntensity;
                
                return (
                  <tr 
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`group cursor-pointer transition-all border-b border-white/5 hover:bg-white/[0.03] ${isSelected ? 'bg-emerald-500/[0.04]' : ''}`}
                  >
                    <td className="py-8 px-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-gray-800'}`}></div>
                        <div>
                          <div className={`text-[15px] font-black uppercase tracking-tight transition-colors ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {agent.name}
                          </div>
                          <div className="text-[10px] text-gray-600 font-mono mt-1 opacity-60">Engine_v{agent.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-center">
                       <span className="text-xl font-black text-blue-400 font-mono tracking-tighter">{agentEffMetric.toFixed(2)}</span>
                    </td>
                    <td className="py-8 px-8 text-center">
                       <span className="text-xl font-black text-emerald-500 font-mono tracking-tighter">{agentSScore.toFixed(2)}</span>
                    </td>
                    <td className="py-8 px-8 text-center">
                       <span className="text-sm font-black text-gray-500 font-mono">{hwProfile.energyBaseline}μJ</span>
                    </td>
                    <td className="py-8 px-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-lg font-black text-white font-mono tracking-tighter">-{mSavings.toFixed(3)}g</span>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-center">
                      <span className={`text-xl font-black font-mono tracking-tighter ${currentUg > 30 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {currentUg.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-8 px-8 text-center">
                       <span className="text-sm font-black text-violet-400 font-mono">{agent.quantumErrorCorrection}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricBox: React.FC<{ label: string; val: string; color: string }> = ({ label, val, color }) => {
  const colors: any = { blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400', violet: 'text-violet-400' };
  const bgs: any = { blue: 'bg-blue-400/5 border-blue-400/10', emerald: 'bg-emerald-400/5 border-emerald-400/10', amber: 'bg-amber-400/5 border-amber-400/10', violet: 'bg-violet-400/5 border-violet-400/10' };
  return (
    <div className={`p-8 rounded-[2rem] border ${bgs[color]} flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 shadow-lg group`}>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">{label}</span>
      <span className={`text-xl font-black font-mono ${colors[color]} tracking-tighter`}>{val}</span>
    </div>
  );
};

export default Dashboard;
