
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData } from '../types';
import QuantumGraph from './QuantumGraph';
import { generateAgentBeatsProposal, analyzeQuantumProvenance, searchGreenStandards, SearchResult } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Green AI standardization 2024');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-500">
            Green-Quantum AgentBench
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Advancing sustainability-aware agent benchmarking with Quantum Limit Graph architectures.
            Integrated with Google Search Grounding for real-time green principle synchronization.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl group hover:border-emerald-500/30 transition-all">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Green Score</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-emerald-400">{selectedAgent.greenScore}</span>
            <span className="text-gray-600 text-sm">/ 100</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${selectedAgent.greenScore}%` }}></div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-xl group hover:border-violet-500/30 transition-all">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">QEC Resilience</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-violet-400">{selectedAgent.quantumErrorCorrection}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 italic">Quantum Limit Error Correction Ratio</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-xl group hover:border-blue-500/30 transition-all">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Provenance Clarity</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-blue-400">{selectedAgent.provenanceClarity}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Lineage transparency index</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-xl group hover:border-amber-500/30 transition-all">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Multilingual Reach</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-amber-400">{selectedAgent.multilingualReach}</span>
            <span className="text-gray-600 text-sm">Langs</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Zero-shot performance across ISO languages</p>
        </div>
      </div>

      {/* Comparison Table Section */}
      <div className="bg-[#111] border border-white/5 p-6 rounded-xl overflow-hidden shadow-2xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
          <i className="fa-solid fa-table-list text-emerald-500"></i>
          <span>Agent Comparison Matrix</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 uppercase font-bold tracking-wider">
                <th className="py-4 px-4">Agent Identifier</th>
                <th className="py-4 px-4">Green Score</th>
                <th className="py-4 px-4">QEC Resilience</th>
                <th className="py-4 px-4">Provenance</th>
                <th className="py-4 px-4 text-right">Latency (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_AGENTS.map((agent) => (
                <tr 
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`group cursor-pointer transition-colors ${
                    selectedAgentId === agent.id ? 'bg-emerald-500/5' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${selectedAgentId === agent.id ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-700'}`}></div>
                      <div>
                        <p className={`font-bold ${selectedAgentId === agent.id ? 'text-emerald-400' : 'text-gray-300'}`}>{agent.name}</p>
                        <p className="text-[10px] text-gray-600 font-mono">v{agent.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-mono ${agent.greenScore >= 90 ? 'text-emerald-400' : 'text-gray-400'}`}>{agent.greenScore}%</span>
                  </td>
                  <td className="py-4 px-4 text-violet-400 font-mono">{agent.quantumErrorCorrection}%</td>
                  <td className="py-4 px-4 text-blue-400 font-mono">{agent.provenanceClarity}%</td>
                  <td className="py-4 px-4 text-right text-gray-500 font-mono">{agent.latency}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualization & Research */}
        <div className="lg:col-span-2 space-y-6">
          <QuantumGraph data={graphData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-white/5 p-6 rounded-xl h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                   <i className="fa-brands fa-google text-blue-400"></i>
                   <span>Research Intelligence</span>
                </h3>
              </div>
              <form onSubmit={handleSearchStandards} className="flex space-x-2 mb-4">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query Green AI standards..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/50 transition-all text-gray-200"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all disabled:opacity-50"
                >
                  <i className={`fa-solid ${isSearching ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`}></i>
                </button>
              </form>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {searchResults ? (
                  <div className="animate-in fade-in duration-700">
                    <p className="text-xs text-gray-400 leading-relaxed mb-4 whitespace-pre-wrap">{searchResults.text}</p>
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Standardization Sources</p>
                      {searchResults.sources.map((src, idx) => (
                        <a 
                          key={idx} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center space-x-2 text-[10px] text-blue-400 hover:underline truncate py-1"
                        >
                          <i className="fa-solid fa-link text-[8px]"></i>
                          <span>{src.title || src.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-700 opacity-50">
                    <i className="fa-solid fa-globe text-4xl"></i>
                    <p className="text-xs italic">Sync with live data to fetch current <br/> Green Principle standardizations.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 p-6 rounded-xl h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Provenance Feed</h3>
                <button 
                  onClick={handleAnalyzeProvenance}
                  disabled={isAnalyzing}
                  className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/20 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh Trace'}
                </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {analysisResult ? (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Detected Anomalies</p>
                      <ul className="space-y-1">
                        {analysisResult.anomalies.map((anomaly, idx) => (
                          <li key={idx} className="text-xs text-red-400 flex items-start space-x-2 bg-red-400/5 p-1 rounded">
                            <i className="fa-solid fa-triangle-exclamation mt-0.5 text-[10px]"></i>
                            <span>{anomaly}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Correction Strategy</p>
                      <div className="bg-white/5 p-3 rounded border border-white/5 text-xs text-emerald-400 font-mono">
                        {analysisResult.correctionPath}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-4">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Confidence Score</span>
                      <span className="text-sm font-bold text-blue-400">{(analysisResult.confidenceScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-700">
                    <i className="fa-solid fa-fingerprint text-3xl opacity-20"></i>
                    <p className="text-xs italic">Execute a provenance trace to verify <br/> agent integrity across the quantum limit.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Thinking Artifact */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fa-solid fa-brain text-5xl text-violet-500"></i>
            </div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
               <span>Benchmark Action</span>
               <div className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-[8px] rounded border border-violet-500/30">THINKING MODE</div>
            </h3>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Reasoning Deeply...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-export"></i>
                  <span>Propose to AgentBeats</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed font-mono">
              * Using Gemini 3 Pro with high reasoning budget (32k tokens) to analyze green-quantum cross-alignment.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-xl h-[645px] flex flex-col shadow-inner">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <i className="fa-solid fa-scroll text-amber-500"></i>
                <span>Proposal Artifact</span>
              </span>
              {report && (
                <button onClick={() => setReport(null)} className="text-[10px] text-gray-600 hover:text-red-400 uppercase font-bold tracking-widest transition-colors">RESET</button>
              )}
            </h3>
            
            <div className="flex-grow overflow-y-auto text-sm text-gray-300 leading-relaxed font-light scroll-smooth custom-scrollbar">
              {report ? (
                <div className="whitespace-pre-wrap mono text-[11px] animate-in fade-in slide-in-from-bottom-2 duration-700 p-2 bg-black/20 rounded border border-white/5">
                  {report}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-600">
                  <i className="fa-solid fa-microchip text-4xl opacity-10"></i>
                  <p className="text-xs italic px-8">Select an agent and trigger high-reasoning proposal generation for the AgentBeats consortium.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
