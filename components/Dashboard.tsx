
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData, A2ARequest, A2AResponse } from '../types';
import QuantumGraph from './QuantumGraph';
import { 
  getPolicyFeedback, 
  getPolicyReporter, 
  getChaosNotice, 
  SearchResult, 
  processA2ATask
} from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isProcessingA2A, setIsProcessingA2A] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [policyReporter, setPolicyReporter] = useState<SearchResult | null>(null);
  const [a2aResponse, setA2aResponse] = useState<A2AResponse | null>(null);
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [chaosNotice, setChaosNotice] = useState<string | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Benchmark memory-to-token ratio across quantum-limit clusters.');

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

  // Handle Chaos Notice monitoring
  useEffect(() => {
    const monitorChaos = async () => {
      const notice = await getChaosNotice(selectedAgent);
      setChaosNotice(notice);
      // Auto-clear after a few seconds or show persistent alert
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

  const handleFetchReport = async () => {
    setIsSearching(true);
    try {
      const report = await getPolicyReporter(selectedAgent.name);
      setPolicyReporter(report);
    } finally {
      setIsSearching(false);
    }
  };

  const radarData = useMemo(() => [
    { subject: 'Latency', A: (1 - selectedAgent.latency / 500) * 100 },
    { subject: 'Energy', A: (1 - selectedAgent.energyPerToken) * 100 },
    { subject: 'Carbon', A: (1 - selectedAgent.carbonIntensity) * 100 },
    { subject: 'Memory', A: selectedAgent.memoryEfficiency },
    { subject: 'QEC', A: selectedAgent.quantumErrorCorrection },
  ], [selectedAgent]);

  const graphData: QuantumGraphData = useMemo(() => ({
    nodes: [
      { id: 'p1', label: 'Green Policy', type: 'policy', val: 90 },
      { id: 'a1', label: 'Agent Core', type: 'agent', val: 80 },
      { id: 'q1', label: 'Quantum Opt', type: 'quantum', val: 70 },
      { id: 'e1', label: 'Fault Shield', type: 'error', val: 60 }
    ],
    links: [
      { source: 'p1', target: 'a1', weight: 20 },
      { source: 'a1', target: 'q1', weight: 15 },
      { source: 'q1', target: 'e1', weight: 10 }
    ]
  }), []);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-1000 max-w-[1600px] mx-auto">
      
      {/* Chaos Notice Bar */}
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
              GREEN_AGENT_ARCHITECTURE_V3
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-500 tracking-tighter italic">
            Control Plane Dashboard
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-light">
            Latency, Energy, Carbon, Memory: The primary quadrant of sustainable agentic reasoning.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          {MOCK_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
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
        
        {/* Policy & Performance Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl">
             <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Sustainability Quadrant</h3>
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

          <button 
            onClick={handleFetchReport}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400 transition-all flex items-center justify-center gap-3"
          >
            {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-chart-column"></i>}
            Generate Policy Reporter
          </button>
        </div>

        {/* Execution & Feedback Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111] border border-white/5 p-8 rounded-3xl relative shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 italic">
                <i className="fa-solid fa-handshake-angle text-emerald-500"></i>
                Policy Execution Handshake
              </h3>
              <button 
                onClick={handlePolicyFeedback}
                disabled={isThinking}
                className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
              >
                {isThinking ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-brain"></i>}
                POLICY_FEEDBACK
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
                    <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-widest">Independent Critique [Thinking Mode]</h4>
                 </div>
                 <div className="text-[11px] text-gray-400 leading-relaxed italic whitespace-pre-wrap font-serif">
                    {policyFeedback}
                 </div>
              </div>
            )}

            <div className="flex justify-end">
               <button 
                onClick={async () => {
                  setIsProcessingA2A(true);
                  try {
                    const res = await processA2ATask({task_id: "GA-1", instruction: a2aInstruction, constraints: []}, selectedAgent);
                    setA2aResponse(res);
                  } finally { setIsProcessingA2A(false); }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl text-[10px] font-black shadow-xl"
               >
                 {isProcessingA2A ? 'CALCULATING_PARETO...' : 'EXECUTE_GREEN_POLICY'}
               </button>
            </div>
          </div>
          
          <QuantumGraph data={graphData} />
        </div>

        {/* Policy Reporter Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl h-full flex flex-col">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-4 flex justify-between items-center">
              Policy Reporter
              <i className="fa-brands fa-google text-blue-400 opacity-30"></i>
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-4">
              {policyReporter ? (
                <div className="space-y-6 animate-in fade-in">
                  <p className="text-[11px] text-gray-400 font-light leading-relaxed">{policyReporter.text}</p>
                  <div className="space-y-2">
                    {policyReporter.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" className="block text-[9px] text-blue-400/80 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 truncate hover:bg-blue-500/10 font-mono">
                        <i className="fa-solid fa-link mr-2"></i> {src.title || "Policy Standard Node"}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-20">
                  <i className="fa-solid fa-file-shield text-5xl"></i>
                  <p className="text-[9px] text-center px-8 uppercase tracking-[0.4em]">Awaiting Policy Report Generation...</p>
                </div>
              )}
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
    <div className={`p-4 rounded-2xl border ${bgs[color]} flex flex-col items-center justify-center gap-1 transition-all hover:scale-105`}>
      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black font-mono ${colors[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
