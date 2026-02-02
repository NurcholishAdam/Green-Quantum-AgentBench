
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { MOCK_AGENTS, QUANTUM_COLORS } from '../constants';
import { AgentBenchmark, QuantumGraphData, A2ARequest, A2AResponse } from '../types';
import QuantumGraph from './QuantumGraph';
import { 
  generateAgentBeatsProposal, 
  analyzeQuantumProvenance, 
  searchGreenStandards, 
  SearchResult, 
  processA2ATask,
  strategicSustainabilityAudit
} from '../services/geminiService';

const SafeContent: React.FC<{ content: any; className?: string }> = ({ content, className }) => {
  if (content === null || content === undefined) return null;
  if (typeof content === 'string') return <span className={className}>{content}</span>;
  if (typeof content === 'number' || typeof content === 'boolean') return <span className={className}>{content.toString()}</span>;
  return (
    <div className={`p-2 bg-black/20 rounded border border-white/5 font-mono text-[9px] ${className}`}>
      {JSON.stringify(content, null, 2)}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingA2A, setIsProcessingA2A] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [a2aResponse, setA2aResponse] = useState<A2AResponse | null>(null);
  const [strategicAdvice, setStrategicAdvice] = useState<string | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Optimize Pareto frontier for accuracy vs. carbon footprint in quantum-limit clusters.');
  
  const [feedbackLogs, setFeedbackLogs] = useState<{ id: string; text: string; timestamp: string; taskId: string }[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

  const triggerBenchmarkSync = async (queryOverride?: string) => {
    setIsSearching(true);
    const query = queryOverride || "Latest 2025 industry benchmarks for Green AI and Sustainable Computing.";
    try {
      const result = await searchGreenStandards(query);
      setSearchResults(result);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStrategicThink = async () => {
    setIsThinking(true);
    setStrategicAdvice(null);
    try {
      const advice = await strategicSustainabilityAudit(selectedAgent, a2aInstruction);
      setStrategicAdvice(advice);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => { triggerBenchmarkSync(); }, []);

  const radarData = useMemo(() => [
    { subject: 'Accuracy', A: selectedAgent.greenScore, fullMark: 100 },
    { subject: 'Energy', A: (1 - selectedAgent.energyPerToken) * 100, fullMark: 100 },
    { subject: 'Carbon', A: selectedAgent.provenanceClarity, fullMark: 100 },
    { subject: 'Latency', A: (1 - selectedAgent.latency / 500) * 100, fullMark: 100 },
    { subject: 'QEC', A: selectedAgent.quantumErrorCorrection, fullMark: 100 },
  ], [selectedAgent]);

  const graphData: QuantumGraphData = useMemo(() => ({
    nodes: [
      { id: 'a1', label: 'Decision Node', type: 'agent', val: 50 },
      { id: 'q1', label: 'Quantum Optimizer', type: 'quantum', val: 70 },
      { id: 'e1', label: 'Error Shield', type: 'error', val: 40 },
      { id: 'p1', label: 'Carbon Trace', type: 'provenance', val: 60 },
      { id: 'p2', label: 'Energy Origin', type: 'provenance', val: 30 },
      { id: 'q2', label: 'Pareto Kernel', type: 'quantum', val: 80 },
    ],
    links: [
      { source: 'a1', target: 'q1', weight: 5 },
      { source: 'q1', target: 'e1', weight: 8 },
      { source: 'q1', target: 'q2', weight: 12 },
      { source: 'e1', target: 'a1', weight: 4 },
      { source: 'p1', target: 'a1', weight: 6 },
      { source: 'p2', target: 'p1', weight: 3 },
      { source: 'q2', target: 'p1', weight: 7 },
    ]
  }), []);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-1000 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-leaf"></i> GREEN_AGENT ARCHITECTURE
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-500">
            Multi-Objective Sustainable Bench
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-light">
            Integrating 2025 Green AI protocols with Quantum Fidelity benchmarks.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          {MOCK_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedAgentId === agent.id 
                  ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile & Metrics */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Sustainability Radar</h3>
             <ResponsiveContainer width="100%" height={240}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                  <Radar name={selectedAgent.name} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Core Efficiency</h3>
            <MetricItem label="Grid Purity" val={`${selectedAgent.greenScore}%`} color="emerald" />
            <MetricItem label="PUE Ratio" val="1.08" color="violet" />
            <MetricItem label="Carbon Trace" val={`${selectedAgent.provenanceClarity}%`} color="blue" />
            <MetricItem label="Energy/T" val={`${selectedAgent.energyPerToken}μJ`} color="amber" />
          </div>
        </div>

        {/* Execution & Thinking Sandbox */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">A2A_SUSTAINABILITY_LEDGER</h3>
              <div className="flex items-center gap-2">
                 <button onClick={handleStrategicThink} disabled={isThinking} className="bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2">
                    {isThinking ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-brain"></i>}
                    STRATEGIC_ALIGNMENT
                 </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  value={a2aInstruction}
                  onChange={(e) => setA2aInstruction(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-[11px] text-emerald-500/80 font-mono h-24 outline-none transition-all"
                  placeholder="Inject Green Handshake instruction..."
                />
                <button 
                  onClick={async () => {
                    setIsProcessingA2A(true);
                    try {
                      const res = await processA2ATask({task_id: "T-1", instruction: a2aInstruction, constraints: []}, selectedAgent);
                      setA2aResponse(res);
                    } finally { setIsProcessingA2A(false); }
                  }}
                  disabled={isProcessingA2A}
                  className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold shadow-lg"
                >
                  {isProcessingA2A ? 'AUDITING...' : 'RUN_AUDIT'}
                </button>
              </div>

              {strategicAdvice && (
                <div className="bg-violet-900/10 border border-violet-500/20 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center gap-3 mb-4">
                      <i className="fa-solid fa-wand-magic-sparkles text-violet-400"></i>
                      <h4 className="text-[10px] font-black text-violet-300 uppercase tracking-widest">High-Reasoning Sustainable Path</h4>
                   </div>
                   <div className="text-[11px] text-gray-400 leading-relaxed italic prose prose-invert prose-sm max-w-none">
                      {strategicAdvice}
                   </div>
                </div>
              )}

              {a2aResponse && (
                <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95">
                    <div className="bg-black/80 rounded-xl p-4 border border-emerald-500/20">
                      <span className="text-[9px] font-bold text-emerald-400 block mb-2 uppercase">Extraction_Metrics</span>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-gray-500">CARBON:</span>
                            <span className="text-blue-400">{a2aResponse.payload.metrics.carbon_intensity_g || 0.04}g</span>
                         </div>
                         <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-gray-500">ENERGY:</span>
                            <span className="text-amber-400">{a2aResponse.payload.metrics.energy_consumed_uj}μJ</span>
                         </div>
                      </div>
                    </div>
                    <div className="bg-[#0c0c0c] p-4 rounded-xl border border-white/5 overflow-y-auto max-h-40 custom-scrollbar">
                      <h4 className="text-[9px] text-gray-500 font-bold uppercase mb-2">Audit Reasoning</h4>
                      <p className="text-[10px] text-gray-400 italic">
                        <SafeContent content={a2aResponse.reasoning_log} />
                      </p>
                    </div>
                </div>
              )}
            </div>
          </div>
          
          <QuantumGraph data={graphData} />
        </div>

        {/* Industry Grounding */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Global Sync</h3>
              <i className="fa-brands fa-google text-blue-400"></i>
            </div>
            <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-4 border-t border-white/5">
              {searchResults ? (
                <div className="space-y-4 animate-in fade-in duration-700">
                  <p className="text-[11px] text-gray-500 italic leading-relaxed">{searchResults.text}</p>
                  <div className="space-y-2">
                    {searchResults.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" className="block text-[9px] text-blue-400 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 truncate hover:bg-blue-500/10 transition-all">
                        <i className="fa-solid fa-link mr-2"></i> {src.title || "Reference Source"}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic space-y-4">
                  <i className="fa-solid fa-satellite text-4xl"></i>
                  <p className="text-[10px] text-center px-8 uppercase tracking-widest">Establishing secure 2025 ground-truth uplink...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricItem: React.FC<{ label: string; val: string; color: string }> = ({ label, val, color }) => {
  const colorMap: any = { emerald: 'text-emerald-400', violet: 'text-violet-400', blue: 'text-blue-400', amber: 'text-amber-400' };
  const bgMap: any = { emerald: 'bg-emerald-400/5 border-emerald-400/10', violet: 'bg-violet-400/5 border-violet-400/10', blue: 'bg-blue-400/5 border-blue-400/10', amber: 'bg-amber-400/5 border-amber-400/10' };
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] ${bgMap[color]}`}>
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{label}</span>
      <span className={`text-sm font-mono font-bold ${colorMap[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
