
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend 
} from 'recharts';
import { MOCK_AGENTS } from '../constants';
import { AgentBenchmark, QuantumGraphData } from '../types';
import QuantumGraph from './QuantumGraph';
import { generateAgentBeatsProposal } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(MOCK_AGENTS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

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

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-500">
            Green-Quantum AgentBench
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Advancing sustainability-aware agent benchmarking with Quantum Limit Graph architectures.
            Integrated with Quantum Error Correction (QEC) and Multilingual Provenance modules for AgentBeats.
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
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Green Score</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-emerald-400">{selectedAgent.greenScore}</span>
            <span className="text-gray-600 text-sm">/ 100</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${selectedAgent.greenScore}%` }}></div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">QEC Resilience</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-violet-400">{selectedAgent.quantumErrorCorrection}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 italic italic italic italic">Quantum Limit Error Correction Ratio</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Provenance Clarity</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-blue-400">{selectedAgent.provenanceClarity}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Lineage transparency index</p>
        </div>

        <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Multilingual Reach</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-bold text-amber-400">{selectedAgent.multilingualReach}</span>
            <span className="text-gray-600 text-sm">Langs</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Zero-shot performance across ISO languages</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <QuantumGraph data={graphData} />
          
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl h-[400px]">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Comparative Radar Profile</h3>
             <ResponsiveContainer width="100%" height="90%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#666', fontSize: 8 }} />
                  <Radar
                    name={selectedAgent.name}
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
               </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">Benchmark Action</h3>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Synthesizing Report...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-export"></i>
                  <span>Propose to AgentBeats</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              * This will generate a comprehensive LLM-assisted benchmarking proposal based on Quantum Limit and Green Agent metrics.
            </p>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-xl min-h-[500px] flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Proposal Artifact</span>
              {report && (
                <button onClick={() => setReport(null)} className="text-[10px] text-gray-600 hover:text-red-400">CLEAR</button>
              )}
            </h3>
            
            <div className="flex-grow overflow-y-auto text-sm text-gray-300 leading-relaxed font-light scroll-smooth">
              {report ? (
                <div className="whitespace-pre-wrap mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {report}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-600">
                  <i className="fa-solid fa-microchip text-4xl opacity-20"></i>
                  <p>Select an agent and click propose to generate a benchmarking draft.</p>
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
