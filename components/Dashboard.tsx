
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData, A2ARequest, A2AResponse, HardwareProfile } from '../types';
import QuantumGraph from './QuantumGraph';
import { 
  getPolicyFeedback, 
  getPolicyReporter, 
  getChaosNotice, 
  SearchResult, 
  processA2ATask,
  calculateSScore
} from '../services/geminiService';

interface Props {
  hwProfile: HardwareProfile;
}

const Dashboard: React.FC<Props> = ({ hwProfile }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isThinking, setIsThinking] = useState(false);
  
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [chaosNotice, setChaosNotice] = useState<string | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Benchmark memory-to-token ratio across quantum-limit clusters.');

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

  // Derived S-Score calculation for active agent
  const sScore = useMemo(() => {
    return calculateSScore(selectedAgent.greenScore, selectedAgent.energyPerToken, hwProfile.energyBaseline);
  }, [selectedAgent, hwProfile]);

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

  const radarData = useMemo(() => [
    { subject: 'Latency', A: (1 - selectedAgent.latency / 500) * 100 },
    { subject: 'Energy', A: (1 - selectedAgent.energyPerToken) * 100 },
    { subject: 'Carbon', A: (1 - selectedAgent.carbonIntensity) * 100 },
    { subject: 'Memory', A: selectedAgent.memoryEfficiency },
    { subject: 'QEC', A: selectedAgent.quantumErrorCorrection },
    { subject: 'S-Score', A: sScore },
  ], [selectedAgent, sScore]);

  const graphData: QuantumGraphData = useMemo(() => ({
    nodes: [
      { id: 'hw', label: hwProfile.type, type: 'hardware', val: 100 },
      { id: 'p1', label: 'Strong Sustainability', type: 'policy', val: sScore },
      { id: 'a1', label: selectedAgent.name, type: 'agent', val: selectedAgent.greenScore },
      { id: 'q1', label: 'Quantum Opt', type: 'quantum', val: 70 }
    ],
    links: [
      { source: 'hw', target: 'a1', weight: 25 },
      { source: 'a1', target: 'p1', weight: 20 },
      { source: 'p1', target: 'q1', weight: 15 }
    ]
  }), [selectedAgent, hwProfile, sScore]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-1000 max-w-[1600px] mx-auto">
      
      {chaosNotice && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4 animate-bounce-short">
           <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
              <i className="fa-solid fa-triangle-exclamation"></i>
           </div>
           <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Chaos_Notice // Metric_Anomaly_Detected</p>
              <p className="text-xs text-amber-200/80 italic">{chaosNotice}</p>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 rounded uppercase tracking-tighter">
              {hwProfile.type} // CONTEXT_ACTIVE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-500 tracking-tighter italic uppercase">
            Carbon Control Plane
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-light">
            Strong Sustainability Metric (S-Score): {"$S = A \\cdot e^{-(E/B)}$"} implemented on <span className="text-emerald-500 font-bold">{hwProfile.type}</span>.
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
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Sustainability Radar</h3>
             <ResponsiveContainer width="100%" height={240}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                  <Radar name={selectedAgent.name} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl text-center shadow-inner">
             <div className="text-6xl font-black text-white tracking-tighter mb-1">{sScore.toFixed(1)}</div>
             <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active_S_Score</div>
             <div className="text-[9px] text-gray-600 mt-2 font-mono italic">Penalized for Hardware Baseline B={hwProfile.energyBaseline}</div>
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
                className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
              >
                {isThinking ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-brain"></i>}
                ANALYZE_EMISSIONS
              </button>
            </div>
            
            <textarea 
              value={a2aInstruction}
              onChange={(e) => setA2aInstruction(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-[11px] text-emerald-500/80 font-mono h-28 outline-none focus:border-emerald-500/40"
              placeholder="Inject Green Agent command..."
            />

            {policyFeedback && (
              <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-2xl animate-in slide-in-from-top-4">
                 <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
                    <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-widest">Supervisor_Critique [Thinking Mode]</h4>
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
              Scope 3 Ticker
              <i className="fa-brands fa-google text-blue-400 opacity-30"></i>
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4 pt-4">
               <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <div className="text-[8px] font-black text-red-500 uppercase mb-1">External_Network_Hop</div>
                  <div className="text-xs text-gray-400 italic">Simulated Search: +0.05g CO2eq</div>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-2xl opacity-40">
                  <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Datacenter_Cooling_Tax</div>
                  <div className="text-xs text-gray-600 italic">Regional Coefficient: 1.14x</div>
               </div>
               <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <div className="text-[8px] font-black text-blue-500 uppercase mb-1">Grid_Intensity_Sync</div>
                  <div className="text-xs text-gray-400 italic">Tracking Live Megawatts...</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Agent Benchmarking Ledger Section */}
      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
           <div>
             <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] font-mono mb-1">Agent_Benchmarking_Ledger</h3>
             <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Cross-Contextual Performance Matrix</p>
           </div>
           <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active_Hardware</span>
                <span className="text-xs font-mono text-white">{hwProfile.type}</span>
              </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest">Agent_Entity</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Version</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Base_Accuracy</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Energy/T (μJ)</th>
                <th className="py-4 px-6 text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center">S-Score (Live)</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">HW_Baseline (B)</th>
                <th className="py-4 px-6 text-[9px] font-black text-gray-600 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AGENTS.map((agent) => {
                const calculatedS = calculateSScore(agent.greenScore, agent.energyPerToken, hwProfile.energyBaseline);
                const isSelected = agent.id === selectedAgentId;
                
                return (
                  <tr 
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`group cursor-pointer transition-all border-b border-white/5 hover:bg-white/[0.02] ${isSelected ? 'bg-emerald-500/[0.03]' : ''}`}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-gray-800'} transition-colors`}></div>
                        <div>
                          <div className={`text-xs font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {agent.name}
                          </div>
                          <div className="text-[8px] text-gray-600 font-mono mt-0.5">{agent.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center text-[10px] font-mono text-gray-500 italic">v{agent.version}</td>
                    <td className="py-5 px-6 text-center">
                      <span className="text-xs font-mono font-bold text-gray-400">{agent.greenScore}%</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="text-xs font-mono font-bold text-amber-500/80">{agent.energyPerToken}</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-black font-mono ${calculatedS > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {calculatedS.toFixed(2)}
                        </span>
                        <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${calculatedS > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${calculatedS}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="text-[10px] font-mono text-gray-600">{hwProfile.energyBaseline}μJ</span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800/50 text-gray-600'}`}>
                        {isSelected ? 'Monitoring' : 'Standby'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex items-center justify-between text-[9px] font-black text-gray-700 uppercase tracking-widest">
           <div className="flex gap-6">
              <span>* S-Score indicates dynamic efficiency equilibrium</span>
              <span>* B baseline context: {hwProfile.type}</span>
           </div>
           <div className="flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-emerald-500/20"></i>
              Ledger_Verified_By_Provenance_Link
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
    <div className={`p-4 rounded-2xl border ${bgs[color]} flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 shadow-lg`}>
      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black font-mono ${colors[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
