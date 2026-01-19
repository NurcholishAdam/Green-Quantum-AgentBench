
import React, { useState, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData, A2ARequest, A2AResponse } from '../types';
import QuantumGraph from './QuantumGraph';
import { generateAgentBeatsProposal, analyzeQuantumProvenance, searchGreenStandards, SearchResult, processA2ATask } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingA2A, setIsProcessingA2A] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('Green AI standardization 2025 energy metrics');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [a2aResponse, setA2aResponse] = useState<A2AResponse | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Evaluate multi-modal entropy reduction in the quantum-limit pipeline.');
  
  // Feedback Loop States
  const [userFeedback, setUserFeedback] = useState('');
  const [feedbackLogs, setFeedbackLogs] = useState<{ id: string; text: string; timestamp: string; taskId: string }[]>([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<{
    anomalies: string[];
    correctionPath: string;
    confidenceScore: number;
  } | null>(null);

  const selectedAgent = useMemo(() => 
    MOCK_AGENTS.find(a => a.id === selectedAgentId) || MOCK_AGENTS[0], 
  [selectedAgentId]);

  const radarData = useMemo(() => [
    { subject: 'Green Score', A: selectedAgent.greenScore, fullMark: 100 },
    { subject: 'Quantum QEC', A: selectedAgent.quantumErrorCorrection, fullMark: 100 },
    { subject: 'Provenance', A: selectedAgent.provenanceClarity, fullMark: 100 },
    { subject: 'Multilingual', A: selectedAgent.multilingualReach, fullMark: 100 },
    { subject: 'Efficiency', A: (1 - selectedAgent.energyPerToken) * 100, fullMark: 100 },
  ], [selectedAgent]);

  const graphData: QuantumGraphData = useMemo(() => ({
    nodes: [
      { id: 'a1', label: 'Agent Decision', type: 'agent', val: 50 },
      { id: 'q1', label: 'Quantum Kernel', type: 'quantum', val: 70 },
      { id: 'e1', label: 'Error Mitigation', type: 'error', val: 40 },
      { id: 'p1', label: 'Data Provenance', type: 'provenance', val: 60 },
      { id: 'p2', label: 'Source Trace', type: 'provenance', val: 30 },
      { id: 'q2', label: 'Entangled Logic', type: 'quantum', val: 80 },
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
    setA2aResponse(null); // Clear previous
    const request: A2ARequest = {
      task_id: `BEATS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      instruction: a2aInstruction,
      constraints: ["A2A Compliance v2.1", "Green Principles Standard", "JSON Payload Output"]
    };
    try {
      const result = await processA2ATask(request, selectedAgent);
      setA2aResponse(result);
    } finally {
      setIsProcessingA2A(false);
    }
  };

  const handleFeedbackSubmit = () => {
    if (!userFeedback.trim() || !a2aResponse) return;
    setIsSubmittingFeedback(true);
    
    // Simulate logging feedback
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      text: userFeedback,
      timestamp: new Date().toLocaleTimeString(),
      taskId: a2aResponse.payload.metadata.timestamp // Using timestamp as proxy for task unique identifier in mock
    };

    setTimeout(() => {
      setFeedbackLogs(prev => [newLog, ...prev]);
      setUserFeedback('');
      setIsSubmittingFeedback(false);
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
      {/* Header Section with Competition Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-check-circle"></i> A2A Compliance v2.1
            </span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-brands fa-docker"></i> Dockerized Independence
            </span>
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[9px] font-bold border border-violet-500/20 rounded uppercase tracking-tighter flex items-center gap-1">
              <i className="fa-solid fa-brain"></i> RLHF Feedback Loop
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-500">
            Green-Quantum AgentBench
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl font-light leading-relaxed">
            Benchmarking architecture optimized for the <span className="text-emerald-500 font-medium italic">AgentBeats</span> competition. 
            Utilizing high-reasoning Gemini 3 models for A2A-standard payload synthesis and green synchronization.
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

      {/* Main Grid: Research, Simulation, and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stats Console - 3 Columns */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <i className="fa-solid fa-compass text-emerald-500"></i> Efficiency Profile
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
              <i className="fa-solid fa-microchip text-violet-500"></i> Runtime Metrics
            </h3>
            <MetricItem label="Green Score" val={`${selectedAgent.greenScore}%`} color="emerald" />
            <MetricItem label="QEC Resilience" val={`${selectedAgent.quantumErrorCorrection}%`} color="violet" />
            <MetricItem label="Provenance" val={`${selectedAgent.provenanceClarity}%`} color="blue" />
            <MetricItem label="Energy/Token" val={`${selectedAgent.energyPerToken}μJ`} color="amber" />
          </div>
          
          {/* Feedback History Log */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl h-[280px] flex flex-col">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-amber-500"></i> Research Feedback Log
            </h3>
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {feedbackLogs.length > 0 ? (
                feedbackLogs.map((log) => (
                  <div key={log.id} className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[10px]">
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-500/80 font-bold uppercase tracking-tighter">RLHF REFINEMENT</span>
                      <span className="text-gray-600 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-400 italic line-clamp-3">"{log.text}"</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 px-4">
                  <i className="fa-solid fa-inbox text-2xl mb-2"></i>
                  <p className="text-[9px] uppercase font-bold tracking-widest leading-relaxed">Awaiting Human-In-The-Loop Data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Search & A2A Simulation - 6 Columns */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Dedicated Search Intelligence Section */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fa-solid fa-earth-americas text-6xl text-blue-500"></i>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-brands fa-google text-blue-400"></i>
                <span>Search Grounding Intelligence</span>
              </h3>
              <div className="flex items-center gap-1 text-[8px] font-bold text-blue-400/60 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
                GEMINI-3-FLASH
              </div>
            </div>
            
            <form onSubmit={handleSearchStandards} className="relative mb-6">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-gray-200 placeholder:text-gray-600"
                placeholder="Synchronize with latest Green Principle standardizations..."
              />
              <button 
                type="submit"
                disabled={isSearching} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                RESEARCH
              </button>
            </form>

            <div className="h-44 overflow-y-auto space-y-4 pr-2 custom-scrollbar border-t border-white/5 pt-4">
              {searchResults ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-xs text-gray-400 leading-relaxed font-light mb-4 whitespace-pre-wrap">{searchResults.text}</p>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Grounding Sources</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {searchResults.sources.map((src, i) => (
                        <a 
                          key={i} 
                          href={src.uri} 
                          target="_blank" 
                          className="flex items-center gap-2 text-[9px] text-blue-400 hover:text-blue-300 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all"
                        >
                          <i className="fa-solid fa-link text-[8px] opacity-60"></i>
                          <span className="truncate">{src.title || src.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-700 opacity-40 italic space-y-2">
                  <i className="fa-solid fa-satellite text-2xl"></i>
                  <p className="text-[10px]">Awaiting live research synchronization via Google Search Grounding...</p>
                </div>
              )}
            </div>
          </div>

          {/* A2A Simulation Container with Feedback Loop */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-terminal text-emerald-500"></i>
                <span>A2A Protocol Sandbox</span>
              </h3>
              <span className="text-[9px] text-emerald-500/60 font-mono tracking-tighter">ENVIRONMENT: DOCKER_A2A_ISO</span>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  value={a2aInstruction}
                  onChange={(e) => setA2aInstruction(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-[11px] text-emerald-500/80 font-mono h-20 focus:border-emerald-500/40 outline-none transition-all placeholder:text-emerald-900"
                  placeholder="Inject A2A Task Instruction..."
                />
                <button 
                  onClick={handleRunA2ASimulation}
                  disabled={isProcessingA2A}
                  className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {isProcessingA2A ? 'PROCESS_A2A...' : 'EXECUTE_PAYLOAD'}
                </button>
              </div>

              {a2aResponse && (
                <div className="space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/80 rounded-xl p-4 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                        <span className="text-[9px] font-bold text-emerald-400">A2A_JSON_PAYLOAD</span>
                        <i className="fa-solid fa-check text-[8px] text-emerald-500"></i>
                      </div>
                      <pre className="text-[10px] text-emerald-500/90 overflow-x-auto font-mono leading-relaxed">
                        {JSON.stringify(a2aResponse.payload, null, 2)}
                      </pre>
                    </div>
                    <div className="bg-[#0c0c0c] p-4 rounded-xl border border-white/5 space-y-4">
                      <div>
                        <h4 className="text-[9px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-1">
                          <i className="fa-solid fa-microscope text-violet-400"></i> RLHF Logic Trace
                        </h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed font-light">{a2aResponse.reasoning_log}</p>
                      </div>
                      <div className="pt-3 border-t border-white/5">
                        <h4 className="text-[9px] text-violet-400 font-bold uppercase mb-1">Self-Critique Modality</h4>
                        <p className="text-[10px] text-gray-500 italic leading-snug">{a2aResponse.rlhf_critique || "Critique module pending..."}</p>
                      </div>
                    </div>
                  </div>

                  {/* Integrated Feedback Loop Mechanism */}
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                        <i className="fa-solid fa-user-gear text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-violet-300">Human-In-The-Loop Feedback</h4>
                        <p className="text-[10px] text-violet-500/70">Refine agent reasoning based on RLHF Critique results</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        placeholder="Critique this result (e.g., 'Increase energy efficiency focus')"
                        className="flex-grow bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-violet-500/40 outline-none transition-all"
                      />
                      <button 
                        onClick={handleFeedbackSubmit}
                        disabled={isSubmittingFeedback || !userFeedback.trim()}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmittingFeedback ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                        LOG FEEDBACK
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Quantum Diagnostics Module */}
          <div className="space-y-4">
            <div className="relative">
              <QuantumGraph data={graphData} />
              <button 
                onClick={handleAnalyzeProvenance}
                disabled={isAnalyzing}
                className="absolute top-4 right-4 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/30 flex items-center gap-2"
              >
                {isAnalyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-stethoscope"></i>}
                RUN DIAGNOSTICS
              </button>
            </div>

            {analysisResult && (
              <div className="bg-[#111] border border-violet-500/20 p-6 rounded-2xl animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-gauge-high"></i>
                    <span>Quantum State Analysis</span>
                  </h3>
                  <div className="text-[10px] font-mono text-gray-500">CONFIDENCE: <span className="text-emerald-400">{Math.round(analysisResult.confidenceScore * 100)}%</span></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Detected Anomalies</p>
                    <div className="space-y-2">
                      {analysisResult.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="bg-red-500/5 border border-red-500/10 p-2 rounded flex items-start gap-2 text-[10px] text-gray-400">
                          <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                          <span>{anomaly}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Correction Path</p>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg">
                      <p className="text-[11px] text-gray-300 leading-relaxed font-light italic">
                        {analysisResult.correctionPath}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Submissions - 3 Columns */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-paper-plane"></i> Submission Hub
            </h3>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white py-3 rounded-xl font-bold text-[11px] transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isGenerating ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Synthesis...</> : 'Propose to Beats'}
            </button>
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
               <div className="flex justify-between text-[10px] border-b border-white/5 pb-2">
                  <span className="text-gray-500">Thinking Mode</span>
                  <span className="text-violet-400 font-mono">ACTIVE (32k)</span>
               </div>
               <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Standard</span>
                  <span className="text-emerald-400 font-mono">A2A_COMPLIANT</span>
               </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl h-[570px] flex flex-col shadow-inner">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-scroll text-amber-500"></i> Reasoning Artifact
            </h3>
            <div className="flex-grow overflow-y-auto text-[11px] text-gray-400 leading-relaxed font-light custom-scrollbar">
              {report ? (
                <div className="whitespace-pre-wrap mono bg-black/40 p-4 rounded-xl border border-white/10 animate-in fade-in duration-700 shadow-inner leading-relaxed">
                  {report}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-10">
                  <i className="fa-solid fa-robot text-5xl"></i>
                  <p className="text-[10px] px-4 font-bold tracking-widest uppercase">Awaiting High-Reasoning Generation</p>
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
  const colorMap = {
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400'
  };
  const bgMap = {
    emerald: 'bg-emerald-400/5 border-emerald-400/10',
    violet: 'bg-violet-400/5 border-violet-400/10',
    blue: 'bg-blue-400/5 border-blue-400/10',
    amber: 'bg-amber-400/5 border-amber-400/10'
  };
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] ${bgMap[color]}`}>
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{label}</span>
      <span className={`text-sm font-mono font-bold ${colorMap[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
