
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData, A2ARequest, A2AResponse } from '../types';
import QuantumGraph from './QuantumGraph';
import { generateAgentBeatsProposal, analyzeQuantumProvenance, searchGreenStandards, SearchResult, processA2ATask } from '../services/geminiService';

// Helper to safely render content that might be an object (Fixes React Error 31)
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
  
  const [searchQuery, setSearchQuery] = useState('Multi-objective AI optimization 2025 benchmarks');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [a2aResponse, setA2aResponse] = useState<A2AResponse | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Optimize Pareto frontier for accuracy vs. carbon footprint in quantum-limit clusters.');
  
  // Feedback Loop States
  const [userFeedback, setUserFeedback] = useState('');
  const [feedbackLogs, setFeedbackLogs] = useState<{ id: string; text: string; timestamp: string; taskId: string }[]>([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const feedbackRef = useRef<HTMLDivElement>(null);

  const [analysisResult, setAnalysisResult] = useState<{
    anomalies: string[];
    correctionPath: string;
    confidenceScore: number;
  } | null>(null);

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

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

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await generateAgentBeatsProposal(selectedAgent);
      setReport(res || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunA2ASimulation = async () => {
    setIsProcessingA2A(true);
    setA2aResponse(null);
    setShowFeedbackSuccess(false);
    const request: A2ARequest = {
      task_id: `PARETO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      instruction: a2aInstruction,
      constraints: ["ISO-42001 Sustainability", "Pareto Frontier Alignment", "Latency Bound < 150ms"]
    };
    try {
      const result = await processA2ATask(request, selectedAgent);
      setA2aResponse(result);
      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    } finally {
      setIsProcessingA2A(false);
    }
  };

  const handleFeedbackSubmit = () => {
    if (!userFeedback.trim() || !a2aResponse) return;
    setIsSubmittingFeedback(true);
    
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      text: userFeedback,
      timestamp: new Date().toLocaleTimeString(),
      taskId: a2aResponse.payload.metadata.timestamp 
    };

    setTimeout(() => {
      setFeedbackLogs(prev => [newLog, ...prev]);
      setUserFeedback('');
      setIsSubmittingFeedback(false);
      setShowFeedbackSuccess(true);
      setTimeout(() => setShowFeedbackSuccess(false), 3000);
    }, 600);
  };

  const handleAnalyzeProvenance = async () => {
    setIsAnalyzing(true);
    const mockLogs = `
      [TIMESTAMP: ${new Date().toISOString()}] AGENT: ${selectedAgent.name}
      [PROVENANCE] TRACE: node_a1 -> node_q1 -> node_e1
      [SIGNAL] COHERENCE_LEVEL: 0.941
      [ERROR] SYNDROME_DETECTED: PHASE_FLIP_RECURSION_002
      [STATE] ENTROPY_VAL: 0.042
      [STATE] QEC_OVERHEAD: 12%
    `;
    try {
      const result = await analyzeQuantumProvenance(mockLogs);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearchStandards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await searchGreenStandards(searchQuery);
      setSearchResults(result);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-scale-balanced"></i> Pareto Optimized
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-leaf"></i> Carbon Aligned
            </span>
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[9px] font-bold border border-violet-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-bolt-lightning"></i> Low-Latency Kernel
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-500">
            Multi-Objective AgentBench
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-light leading-relaxed">
            Evaluating agents across the 4-vector optimization space: <span className="text-white font-medium">Accuracy, Energy, Carbon, and Latency.</span> 
            Utilizing high-reasoning Gemini 3 for A2A-standard payload synthesis.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          {MOCK_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                selectedAgentId === agent.id 
                  ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <i className="fa-solid fa-compass text-emerald-500"></i> Multi-Objective Profile
             </h3>
             <ResponsiveContainer width="100%" height={240}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                  <Radar
                    name={selectedAgent.name}
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-microchip text-violet-500"></i> Objective Metrics
            </h3>
            <MetricItem label="Accuracy Index" val={`${selectedAgent.greenScore}%`} color="emerald" />
            <MetricItem label="Latency Bounds" val={`${selectedAgent.latency}ms`} color="violet" />
            <MetricItem label="Carbon Trace" val={`${selectedAgent.provenanceClarity}%`} color="blue" />
            <MetricItem label="Energy Cost" val={`${selectedAgent.energyPerToken}μJ`} color="amber" />
          </div>
          
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl h-[340px] flex flex-col">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-amber-500"></i> Research Logs
            </h3>
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {feedbackLogs.length > 0 ? (
                feedbackLogs.map((log) => (
                  <div key={log.id} className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[10px] animate-in slide-in-from-left-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-500/80 font-bold uppercase tracking-tighter">RLHF_SYNC</span>
                      <span className="text-gray-600 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-400 italic leading-relaxed">"{log.text}"</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 px-4">
                  <i className="fa-solid fa-inbox text-2xl mb-2"></i>
                  <p className="text-[9px] uppercase font-bold tracking-widest leading-relaxed">Awaiting Payload Refinement</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fa-solid fa-earth-americas text-6xl text-blue-500"></i>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-brands fa-google text-blue-400"></i>
                <span>Sustainability Standards Sync</span>
              </h3>
              <div className="flex items-center gap-1 text-[8px] font-bold text-blue-400/60 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
                LIVE_GROUNDING
              </div>
            </div>
            
            <form onSubmit={handleSearchStandards} className="relative mb-6">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-gray-200"
                placeholder="Query global Pareto benchmarks..."
              />
              <button 
                type="submit"
                disabled={isSearching} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
              >
                {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
              </button>
            </form>

            <div className="h-44 overflow-y-auto space-y-4 pr-2 custom-scrollbar border-t border-white/5 pt-4">
              {searchResults ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs text-gray-400 leading-relaxed font-light mb-4">{searchResults.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {searchResults.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" className="text-[9px] text-blue-400 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 truncate">
                        <i className="fa-solid fa-link mr-1"></i> {src.title || src.uri}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-700 opacity-40 italic">
                  <p className="text-[10px]">Ready for multi-objective search grounding...</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative shadow-2xl">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              <i className="fa-solid fa-terminal text-emerald-500"></i>
              <span>Execution Sandbox</span>
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  value={a2aInstruction}
                  onChange={(e) => setA2aInstruction(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-[11px] text-emerald-500/80 font-mono h-20 outline-none transition-all"
                  placeholder="Inject multi-objective task instruction..."
                />
                <button 
                  onClick={handleRunA2ASimulation}
                  disabled={isProcessingA2A}
                  className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg"
                >
                  {isProcessingA2A ? 'PROVISIONING...' : 'RUN_PARETO'}
                </button>
              </div>

              {a2aResponse && (
                <div className="space-y-4 animate-in zoom-in-95">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/80 rounded-xl p-4 border border-emerald-500/20">
                      <span className="text-[9px] font-bold text-emerald-400 block mb-2">METRIC_EXTRACTION</span>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                         <div className="bg-white/5 p-2 rounded">
                            <p className="text-[8px] text-gray-500 uppercase">Carbon</p>
                            <p className="text-xs text-blue-400 font-mono">{(a2aResponse.payload.metrics as any).carbon_intensity_g || '0.04'}g</p>
                         </div>
                         <div className="bg-white/5 p-2 rounded">
                            <p className="text-[8px] text-gray-500 uppercase">Latency</p>
                            <p className="text-xs text-violet-400 font-mono">{(a2aResponse.payload.metrics as any).latency_ms || '45'}ms</p>
                         </div>
                      </div>
                      <pre className="text-[10px] text-emerald-500/90 overflow-x-auto h-20 custom-scrollbar">
                        {JSON.stringify(a2aResponse.payload, null, 2)}
                      </pre>
                    </div>
                    <div className="bg-[#0c0c0c] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[9px] text-gray-500 font-bold uppercase mb-2">Internal Reasoning</h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-light italic">
                          <SafeContent content={a2aResponse.reasoning_log} />
                        </p>
                      </div>
                      <div className="pt-3 border-t border-white/5 mt-3">
                        <h4 className="text-[9px] text-violet-400 font-bold uppercase mb-1">Pareto Frontier Critique</h4>
                        <p className="text-[10px] text-gray-500 font-light">
                          <SafeContent content={a2aResponse.rlhf_critique} />
                        </p>
                      </div>
                    </div>
                  </div>

                  <div ref={feedbackRef} className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                          <i className="fa-solid fa-user-gear"></i>
                        </div>
                        <h4 className="text-xs font-bold text-violet-300">Human-In-The-Loop Refinement</h4>
                      </div>
                      {showFeedbackSuccess && (
                        <div className="text-[9px] text-emerald-400 font-bold animate-pulse">
                          REF_LOGGED_SUCCESSFULLY
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        placeholder="Refine the objective weights..."
                        className="flex-grow bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-violet-500/40 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleFeedbackSubmit()}
                      />
                      <button 
                        onClick={handleFeedbackSubmit}
                        disabled={isSubmittingFeedback || !userFeedback.trim()}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold"
                      >
                        LOG_RLHF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <QuantumGraph data={graphData} />
            <button 
              onClick={handleAnalyzeProvenance}
              disabled={isAnalyzing}
              className="absolute top-4 right-4 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-2"
            >
              {isAnalyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-stethoscope"></i>}
              PROVENANCE_AUDIT
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-paper-plane"></i> Final Submission
            </h3>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white py-3 rounded-xl font-bold text-[11px] transition-all shadow-xl disabled:opacity-50 tracking-widest"
            >
              {isGenerating ? 'SYNTHESIZING...' : 'GENERATE WHITE PAPER'}
            </button>
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
               <div className="flex justify-between text-[10px] border-b border-white/5 pb-2">
                  <span className="text-gray-500 font-mono tracking-tighter">Budget Mode</span>
                  <span className="text-violet-400 font-mono">THINKING_32K</span>
               </div>
               <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500 font-mono tracking-tighter">Objective Focus</span>
                  <span className="text-emerald-400 font-mono">PARETO_SYNC</span>
               </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl h-[570px] flex flex-col shadow-inner">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-scroll text-amber-500"></i> Technical Manuscript
            </h3>
            <div className="flex-grow overflow-y-auto text-[11px] text-gray-400 leading-relaxed font-light custom-scrollbar">
              {report ? (
                <div className="whitespace-pre-wrap mono bg-black/40 p-4 rounded-xl border border-white/10 animate-in fade-in duration-700 leading-relaxed">
                  {report}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-10">
                  <i className="fa-solid fa-robot text-5xl"></i>
                  <p className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">Awaiting High-Reasoning Synthesis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricItem: React.FC<{ label: string; val: string; color: 'emerald' | 'violet' | 'blue' | 'amber' }> = ({ label, val, color }) => {
  const colorMap = { emerald: 'text-emerald-400', violet: 'text-violet-400', blue: 'text-blue-400', amber: 'text-amber-400' };
  const bgMap = { emerald: 'bg-emerald-400/5 border-emerald-400/10', violet: 'bg-violet-400/5 border-violet-400/10', blue: 'bg-blue-400/5 border-blue-400/10', amber: 'bg-amber-400/5 border-amber-400/10' };
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] ${bgMap[color]}`}>
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{label}</span>
      <span className={`text-sm font-mono font-bold ${colorMap[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
