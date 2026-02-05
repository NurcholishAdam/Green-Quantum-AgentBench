
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData, HardwareProfile } from '../types';
import QuantumGraph from './QuantumGraph';
import { 
  getPolicyFeedback, 
  getChaosNotice, 
  calculateSScore,
  calculateUGScore,
  getLiveEnvironmentData,
  SearchResult
} from '../services/geminiService';

interface Props {
  hwProfile: HardwareProfile;
}

const Dashboard: React.FC<Props> = ({ hwProfile }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isThinking, setIsThinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [chaosNotice, setChaosNotice] = useState<string | null>(null);
  const [envData, setEnvData] = useState<SearchResult | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Optimize semantic density for Edge TPU execution.');

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

  const sScore = useMemo(() => {
    return calculateSScore(selectedAgent.greenScore, selectedAgent.energyPerToken, hwProfile.energyBaseline);
  }, [selectedAgent, hwProfile]);

  const uG = useMemo(() => {
    return calculateUGScore(selectedAgent.greenScore, selectedAgent.energyPerToken, selectedAgent.latency);
  }, [selectedAgent]);

  // Shadow Metrics for Marginal Savings
  const legacyFootprint = useMemo(() => selectedAgent.carbonIntensity * 2.8, [selectedAgent]);
  const savingsGrams = useMemo(() => legacyFootprint - selectedAgent.carbonIntensity, [legacyFootprint, selectedAgent]);
  const savingsPercentage = useMemo(() => (savingsGrams / legacyFootprint) * 100, [savingsGrams, legacyFootprint]);

  useEffect(() => {
    const monitorChaos = async () => {
      const notice = await getChaosNotice(selectedAgent);
      setChaosNotice(notice);
    };
    monitorChaos();
    const interval = setInterval(monitorChaos, 15000);
    return () => clearInterval(interval);
  }, [selectedAgent]);

  const radarData = useMemo(() => [
    { subject: 'Latency', A: (1 - selectedAgent.latency / 500) * 100 },
    { subject: 'Energy', A: (1 - selectedAgent.energyPerToken) * 100 },
    { subject: 'Carbon', A: (1 - selectedAgent.carbonIntensity) * 100 },
    { subject: 'Memory', A: selectedAgent.memoryEfficiency },
    { subject: 'Ug Utility', A: uG },
    { subject: 'S-Score', A: sScore },
  ], [selectedAgent, sScore, uG]);

  return (
    <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-1000 max-w-[1600px] mx-auto">
      
      {/* Marginal Savings Global Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-10">
         <div className="md:col-span-2 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-8 relative z-10">
               <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-4xl text-emerald-500 shadow-xl shadow-emerald-500/5">
                  <i className="fa-solid fa-leaf-heart"></i>
               </div>
               <div>
                  <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2 font-mono italic">Marginal_Carbon_Savings_Index</h2>
                  <p className="text-3xl font-black text-white tracking-tighter">Your current path avoids <span className="text-emerald-500">{(savingsGrams * 24).toFixed(2)}g</span> of CO2 per day.</p>
                  <div className="flex items-center gap-6 mt-4">
                     <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500/60 uppercase">
                        <i className="fa-solid fa-check-circle"></i> {savingsPercentage.toFixed(1)}% More Efficient Than Standard
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-black text-blue-500/60 uppercase">
                        <i className="fa-solid fa-bolt"></i> Low-Entropy Dispatch: Active
                     </div>
                  </div>
               </div>
            </div>
            <div className="hidden lg:block text-right pr-4">
               <div className="text-[9px] font-black text-gray-600 uppercase mb-1 tracking-widest">Tangible_Offset</div>
               <div className="text-xl font-black text-white italic">≈ 120 Saved Watts</div>
            </div>
         </div>
         
         <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-xl group hover:border-emerald-500/20 transition-all">
            <div className="text-5xl font-black text-emerald-500 mb-2 tracking-tighter">{uG.toFixed(1)}</div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Green_Utility_Score ($U_g$)</div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${uG}%` }}></div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#111] border border-white/5 p-8 rounded-3xl shadow-xl">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 border-b border-white/5 pb-2 italic">Performance_Symmetry ($U_g$)</h3>
             <ResponsiveContainer width="100%" height={240}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
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
          <div className="bg-[#0d0d0d] border border-white/5 p-10 rounded-[3rem] relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <i className="fa-solid fa-fingerprint text-9xl"></i>
            </div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-4 italic">
                <i className="fa-solid fa-handshake-angle text-emerald-500"></i>
                Supervisor_Shadow_Audit
              </h3>
              <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg">
                LIVE_CONSULTANT: READY
              </div>
            </div>
            
            <textarea 
              value={a2aInstruction}
              onChange={(e) => setA2aInstruction(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-8 text-xs text-emerald-500/80 font-mono h-32 outline-none focus:border-emerald-500/40 shadow-inner"
              placeholder="Inject command for trade protocol analysis..."
            />
            
            <div className="flex gap-4 mt-6">
               <button className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-xl shadow-emerald-500/5">Execute_Audit</button>
               <button className="px-8 py-4 bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black uppercase rounded-xl hover:text-white transition-all">Export_Report</button>
            </div>
          </div>
          
          <QuantumGraph data={{
            nodes: [
              { id: 'hw', label: hwProfile.type, type: 'hardware', val: 100 },
              { id: 'uG', label: 'Green Utility', type: 'policy', val: uG },
              { id: 'sav', label: 'Marginal Savings', type: 'provenance', val: savingsPercentage },
              { id: 'a1', label: selectedAgent.name, type: 'agent', val: selectedAgent.greenScore }
            ],
            links: [
              { source: 'hw', target: 'a1', weight: 25 },
              { source: 'a1', target: 'uG', weight: 30 },
              { source: 'uG', target: 'sav', weight: 40 }
            ]
          }} />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] shadow-xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-6 flex justify-between items-center italic">
              Value_of_Green_Ledger
              <i className="fa-solid fa-coins text-amber-500/30"></i>
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-6">
               <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl group hover:bg-emerald-500/10 transition-all">
                  <div className="flex justify-between items-center mb-3">
                     <div className="text-[10px] font-black text-emerald-500 uppercase">Carbon_Avoidance</div>
                     <div className="text-[10px] font-mono text-white/40">Real-time</div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tighter">-{savingsGrams.toFixed(3)}g</div>
                  <div className="text-[9px] text-gray-600 mt-2 italic font-serif">"Equivalent to skipping 2.4s of heavy compute."</div>
               </div>

               <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                  <div className="text-[10px] font-black text-blue-500 uppercase mb-3">Baseline_Drift</div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-500 italic">Shadow Cost (H100)</span>
                     <span className="text-sm font-mono text-gray-400">{legacyFootprint.toFixed(2)}g</span>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-white/5 opacity-40">
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                     <span className="text-[9px] font-black text-gray-500 uppercase">Quantization_Trade: OK</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                     <span className="text-[9px] font-black text-gray-500 uppercase">Grid_Intensity_Sync: 242.4g</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBox: React.FC<{ label: string; val: string; color: string }> = ({ label, val, color }) => {
  const colors: any = { blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400', violet: 'text-violet-400' };
  const bgs: any = { blue: 'bg-blue-400/5 border-blue-400/10', emerald: 'bg-emerald-400/5 border-emerald-400/10', amber: 'bg-amber-400/5 border-amber-400/10', violet: 'bg-violet-400/5 border-violet-400/10' };
  return (
    <div className={`p-6 rounded-3xl border ${bgs[color]} flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg group`}>
      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-gray-400 transition-colors">{label}</span>
      <span className={`text-lg font-black font-mono ${colors[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
