
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

  useEffect(() => {
    const monitorChaos = async () => {
      const notice = await getChaosNotice(selectedAgent);
      setChaosNotice(notice);
    };
    monitorChaos();
    const interval = setInterval(monitorChaos, 15000);
    return () => clearInterval(interval);
  }, [selectedAgent]);

  const handlePolicyFeedback = async () => {
    setIsThinking(true);
    setPolicyFeedback(null);
    try {
      const feedback = await getPolicyFeedback(selectedAgent, a2aInstruction);
      setPolicyFeedback(feedback);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFetchEnvData = async () => {
    setIsSearching(true);
    try {
      const data = await getLiveEnvironmentData("Current grid carbon intensity and green AI trends");
      setEnvData(data);
    } finally {
      setIsSearching(false);
    }
  };

  const radarData = useMemo(() => [
    { subject: 'Latency', A: (1 - selectedAgent.latency / 500) * 100 },
    { subject: 'Energy', A: (1 - selectedAgent.energyPerToken) * 100 },
    { subject: 'Carbon', A: (1 - selectedAgent.carbonIntensity) * 100 },
    { subject: 'Memory', A: selectedAgent.memoryEfficiency },
    { subject: 'Ug Utility', A: uG },
    { subject: 'S-Score', A: sScore },
  ], [selectedAgent, sScore, uG]);

  const graphData: QuantumGraphData = useMemo(() => ({
    nodes: [
      { id: 'hw', label: hwProfile.type, type: 'hardware', val: 100 },
      { id: 'uG', label: 'Green Utility', type: 'policy', val: uG },
      { id: 'a1', label: selectedAgent.name, type: 'agent', val: selectedAgent.greenScore },
      { id: 'q1', label: 'Adaptive Trade', type: 'quantum', val: 80 }
    ],
    links: [
      { source: 'hw', target: 'a1', weight: 25 },
      { source: 'a1', target: 'uG', weight: 30 },
      { source: 'uG', target: 'q1', weight: 15 }
    ]
  }), [selectedAgent, hwProfile, sScore, uG]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-1000 max-w-[1600px] mx-auto">
      
      {chaosNotice && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 animate-bounce-short">
           <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
              <i className="fa-solid fa-triangle-exclamation"></i>
           </div>
           <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Chaos_Notice // Carbon_Budget_Warning</p>
              <p className="text-xs text-amber-200/80 italic">{chaosNotice}</p>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 rounded uppercase tracking-tighter">
              {hwProfile.type} // ADAPTIVE_MODE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-500 tracking-tighter italic uppercase">
            Carbon Control Plane
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-light">
            Tracking Green Utility Index (Ug): Penalizing "wasteful" intelligence to ensure lean execution on {hwProfile.type}.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-1.5 rounded-xl shadow-2xl">
          {MOCK_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                selectedAgentId === agent.id 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Utility Radar ($U_g$)</h3>
             <ResponsiveContainer width="100%" height={240}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                  <Radar name={selectedAgent.name} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl text-center shadow-inner group">
             <div className="text-6xl font-black text-white tracking-tighter mb-1 group-hover:text-emerald-400 transition-colors">{uG.toFixed(1)}</div>
             <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Green_Utility_Score (Ug)</div>
             <div className="text-[9px] text-gray-600 mt-2 font-mono italic">Sharpness / Lean Consumption</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <MetricBox label="Latency" val={`${selectedAgent.latency}ms`} color="blue" />
             <MetricBox label="Energy" val={`${selectedAgent.energyPerToken}μJ`} color="emerald" />
             <MetricBox label="Carbon" val={`${selectedAgent.carbonIntensity}g`} color="amber" />
             <MetricBox label="Memory" val={`${selectedAgent.memoryEfficiency}%`} color="violet" />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111] border border-white/5 p-8 rounded-3xl relative shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 italic">
                <i className="fa-solid fa-handshake-angle text-emerald-500"></i>
                Supervisor Context Injection
              </h3>
              <button 
                onClick={handlePolicyFeedback}
                disabled={isThinking}
                className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
              >
                {isThinking ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-scale-balanced"></i>}
                ANALYZE_UTILITY
              </button>
            </div>
            
            <textarea 
              value={a2aInstruction}
              onChange={(e) => setA2aInstruction(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-[11px] text-emerald-500/80 font-mono h-28 outline-none focus:border-emerald-500/40"
              placeholder="Inject command for trade protocol analysis..."
            />

            {policyFeedback && (
              <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl animate-in slide-in-from-top-4">
                 <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-wand-magic-sparkles text-emerald-400"></i>
                    <h4 className="text-[11px] font-black text-emerald-300 uppercase tracking-widest">Supervisor_Intelligence [Pro Thinking]</h4>
                 </div>
                 <div className="text-[11px] text-gray-400 leading-relaxed italic whitespace-pre-wrap font-serif">
                    {policyFeedback}
                 </div>
              </div>
            )}
          </div>
          
          <QuantumGraph data={graphData} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl h-full flex flex-col">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-4 flex justify-between items-center italic">
              Environment_Intelligence
              <button 
                onClick={handleFetchEnvData}
                disabled={isSearching}
                className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all"
              >
                {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-brands fa-google"></i>}
              </button>
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4 pt-4">
               {envData ? (
                 <div className="space-y-4">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-mono italic">
                       {envData.text}
                    </p>
                    <div className="space-y-2">
                       {envData.links.map((link, i) => (
                         <a key={i} href={link.uri} target="_blank" rel="noreferrer" className="block p-3 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 transition-all group">
                            <div className="text-[8px] font-black text-blue-500 uppercase mb-1">Source_{i+1}</div>
                            <div className="text-[10px] text-gray-500 group-hover:text-blue-400 truncate">{link.title}</div>
                         </a>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <div className="text-[8px] font-black text-emerald-500 uppercase mb-1">Trade_Protocol_Active</div>
                      <div className="text-xs text-gray-400 italic">Core traded 0.12g credits to Ultra for Search.</div>
                   </div>
                   <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <div className="text-[8px] font-black text-amber-500 uppercase mb-1">Adaptive_Quantization</div>
                      <div className="text-xs text-gray-400 italic">Switched to 4-bit to respect carbon cap.</div>
                   </div>
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl opacity-40">
                      <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Network_Hop_Tax</div>
                      <div className="text-xs text-gray-600 italic">Scope 3 penalty applied: +0.05g</div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
           <div>
             <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] font-mono mb-1">Agent_Utility_Matrix</h3>
             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Efficiency Benchmarking: Accuracy vs. Burn Rate</p>
           </div>
           <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Hardware_Baseline</span>
                <span className="text-xs font-mono text-white">{hwProfile.type}</span>
              </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest">Agent_Entity</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Latency</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Energy (uJ)</th>
                <th className="py-4 px-6 text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center">Utility (Ug)</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Efficiency</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Credit_Trading</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AGENTS.map((agent) => {
                const currentUg = calculateUGScore(agent.greenScore, agent.energyPerToken, agent.latency);
                const isSelected = agent.id === selectedAgentId;
                
                return (
                  <tr 
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`group cursor-pointer transition-all border-b border-white/5 hover:bg-white/[0.02] ${isSelected ? 'bg-emerald-500/[0.03]' : ''}`}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-800'} transition-all`}></div>
                        <div>
                          <div className={`text-xs font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {agent.name}
                          </div>
                          <div className="text-[8px] text-gray-600 font-mono mt-0.5">v{agent.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center text-xs font-mono text-gray-500">{agent.latency}ms</td>
                    <td className="py-5 px-6 text-center text-xs font-mono text-amber-500/80">{agent.energyPerToken}</td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-black font-mono ${currentUg > 30 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {currentUg.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="w-24 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${currentUg > 30 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, currentUg * 2)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${agent.energyPerToken < 0.1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {agent.energyPerToken < 0.1 ? 'CREDITOR' : 'DEBTOR'}
                      </span>
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
    <div className={`p-4 rounded-2xl border ${bgs[color]} flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 shadow-lg`}>
      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black font-mono ${colors[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
