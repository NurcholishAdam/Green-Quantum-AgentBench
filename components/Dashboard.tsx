
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
  
  const [searchQuery, setSearchQuery] = useState('Green AI standardization 2024');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [a2aResponse, setA2aResponse] = useState<A2AResponse | null>(null);
  const [a2aInstruction, setA2aInstruction] = useState('Optimize data ingestion pipeline for minimal entropy.');
  
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
    const res = await generateAgentBeatsProposal(selectedAgent);
    setReport(res || "Generation failed.");
    setIsGenerating(false);
  };

  const handleRunA2ASimulation = async () => {
    setIsProcessingA2A(true);
    const request: A2ARequest = {
      task_id: `BEATS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      instruction: a2aInstruction,
      constraints: ["Green Principles v2", "Quantum Accuracy > 95%", "ISO-A2A Payload JSON"]
    };
    const result = await processA2ATask(request, selectedAgent);
    setA2aResponse(result);
    setIsProcessingA2A(false);
  };

  const handleAnalyzeProvenance = async () => {
    setIsAnalyzing(true);
    const mockLogs = `
      [TIMESTAMP: ${Date.now()}] AGENT: ${selectedAgent.name}
      [STATE] LOGIC_GATE_ACTIVE: 0x442FF
      [PROVENANCE] TRACE: node_a1 -> node_q1 -> node_e1
      [SIGNAL] COHERENCE_LEVEL: 0.882
      [ERROR] SYNDROME_DETECTED: PHASE_FLIP_RECURSION
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
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 rounded">A2A COMPLIANT</span>
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] font-bold border border-violet-500/20 rounded">DOCKER INDEPENDENT</span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-500">
            Green-Quantum AgentBench
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Autonomous agent benchmarking aligned with AgentBeats competition principles. 
            Robust scoring, A2A JSON payloads, and RLHF-integrated feedback loops.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-1 rounded-lg">
          {MOCK_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`px-4 py-2 text-xs font-bold rounded transition-all ${
                selectedAgentId === agent.id 
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Stats & Radar - Column 1 */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Efficiency Radar</h3>
             <ResponsiveContainer width="100%" height={250}>
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 9 }} />
                  <Radar
                    name={selectedAgent.name}
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
               </RadarChart>
             </ResponsiveContainer>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Metrics Console</h3>
            <MetricItem label="Green Score" val={`${selectedAgent.greenScore}%`} color="emerald" />
            <MetricItem label="QEC Resilience" val={`${selectedAgent.quantumErrorCorrection}%`} color="violet" />
            <MetricItem label="Provenance" val={`${selectedAgent.provenanceClarity}%`} color="blue" />
            <MetricItem label="Energy/Token" val={`${selectedAgent.energyPerToken}μJ`} color="amber" />
          </div>
        </div>

        {/* Center: A2A Simulation & Research - Column 2-3 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* A2A Protocol Simulator */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                <i className="fa-solid fa-code-branch text-emerald-500"></i>
                <span>A2A Protocol Simulation</span>
              </h3>
              <div className="text-[10px] text-gray-600 font-mono">STRICT JSON PAYLOAD</div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  value={a2aInstruction}
                  onChange={(e) => setA2aInstruction(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-4 text-xs text-gray-300 font-mono h-24 focus:border-emerald-500/40 outline-none"
                  placeholder="Enter A2A Task Request Instruction..."
                />
                <button 
                  onClick={handleRunA2ASimulation}
                  disabled={isProcessingA2A}
                  className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-[10px] font-bold transition-all disabled:opacity-50"
                >
                  {isProcessingA2A ? 'EXECUTING...' : 'RUN PROTOCOL'}
                </button>
              </div>

              {a2aResponse && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                  <div className="bg-black/80 rounded-lg p-4 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold ${a2aResponse.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                        PROTOCOL {a2aResponse.status.toUpperCase()}
                      </span>
                      <span className="text-[8px] text-gray-600">A2A_ISO_2024_03_SECURE</span>
                    </div>
                    <pre className="text-[10px] text-emerald-300 overflow-x-auto whitespace-pre-wrap font-mono">
                      {JSON.stringify(a2aResponse.payload, null, 2)}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-white/5">
                      <h4 className="text-[10px] text-gray-500 font-bold uppercase mb-2">Detailed Reasoning (Logs)</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed italic">{a2aResponse.reasoning_log}</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-lg border border-violet-500/20">
                      <h4 className="text-[10px] text-violet-400 font-bold uppercase mb-2">RLHF Evaluation Loop</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{a2aResponse.rlhf_critique || "Awaiting Human-in-the-loop feedback..."}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <QuantumGraph data={graphData} />
          
          {/* Research Section */}
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                 <i className="fa-brands fa-google text-blue-400"></i>
                 <span>Green Standardization Intelligence</span>
              </h3>
            </div>
            <form onSubmit={handleSearchStandards} className="flex space-x-2 mb-4">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/50 transition-all text-gray-200"
                placeholder="Synchronize with recently time data..."
              />
              <button disabled={isSearching} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all disabled:opacity-50">
                <i className={`fa-solid ${isSearching ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`}></i>
              </button>
            </form>
            <div className="h-48 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {searchResults ? (
                <div className="animate-in fade-in duration-700">
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{searchResults.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/20">
                        {src.title || 'Source'}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full opacity-30 text-xs">Awaiting Research synchronization...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Proposals & AgentBeats Integration - Column 4 */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fa-solid fa-brain text-5xl text-violet-500"></i>
            </div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Competition Proposal</h3>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-xs transition-all shadow-lg disabled:opacity-50"
            >
              {isGenerating ? 'THINKING DEEPLY...' : 'GENERATE SUBMISSION'}
            </button>
            <div className="mt-4 pt-4 border-t border-white/5">
               <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                  <span>Thinking Budget</span>
                  <span className="text-violet-400">32k Tokens</span>
               </div>
               <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>Compliance</span>
                  <span className="text-emerald-400">A2A v2.1</span>
               </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-xl h-[530px] flex flex-col shadow-inner">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Submission Artifact</h3>
            <div className="flex-grow overflow-y-auto text-[11px] text-gray-400 leading-relaxed font-light custom-scrollbar">
              {report ? (
                <div className="whitespace-pre-wrap mono bg-black/20 p-3 rounded border border-white/5 animate-in fade-in duration-700">
                  {report}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-600 opacity-20">
                  <i className="fa-solid fa-microchip text-4xl"></i>
                  <p className="italic px-4">Generate reasoning artifact for evaluation loop.</p>
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
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 transition-all hover:border-white/10">
      <span className="text-[10px] text-gray-500 uppercase font-bold">{label}</span>
      <span className={`text-sm font-mono font-bold ${colorMap[color]}`}>{val}</span>
    </div>
  );
};

export default Dashboard;
