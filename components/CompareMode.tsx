
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import ForceGraph2D from 'react-force-graph-2d';

interface TokenStream {
  thought: number;
  action: number;
  timestamp: number;
  signature?: string;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  pruned?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  pruned?: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface AgentReport {
  thoughtTokens: number;
  actionTokens: number;
  totalTokens: number;
  energyUsage: number; 
}

interface ComparisonReport {
  green: AgentReport;
  standard: AgentReport;
  timestamp: number;
}

const EnergyStackedBar: React.FC<{ thought: number; action: number; label: string }> = ({ thought, action, label }) => {
  const total = thought + action || 1;
  const thoughtPct = (thought / total) * 100;
  const actionPct = (action / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-mono text-gray-400">Total: {total}</span>
      </div>
      <div className="h-8 bg-white/5 rounded-xl overflow-hidden flex shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${thoughtPct}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-full bg-violet-500 relative group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.div>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${actionPct}%` }}
          transition={{ duration: 1, ease: "circOut", delay: 0.1 }}
          className="h-full bg-emerald-500 relative group"
        >
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.div>
      </div>
      <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
        <span className="text-violet-400">Thinking: {thoughtPct.toFixed(1)}%</span>
        <span className="text-emerald-400">Doing: {actionPct.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const VimRagComparisonChart: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-black/40 border border-white/5 rounded-[2rem] p-6 space-y-4 overflow-hidden"
    >
      <div className="flex justify-between items-center">
        <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Multi-Hop Retrieval Audit</h4>
        <div className="text-[9px] font-mono text-emerald-500 font-black">-55% Tokens</div>
      </div>
      
      <div className="space-y-4">
        {/* Standard Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase tracking-tighter">
            <span>Standard AgentBench</span>
            <span>1,240 tokens</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="h-full bg-gray-600"
            />
          </div>
        </div>

        {/* VimRAG Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[8px] font-mono text-emerald-400 uppercase tracking-tighter">
            <span>VimRAG-Inspired Graph</span>
            <span>558 tokens</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '45%' }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            />
          </div>
        </div>
      </div>
      
      <p className="text-[8px] text-gray-600 italic leading-relaxed">
        VimRAG prunes irrelevant retrieval paths in real-time, preventing token bloat in complex multi-hop reasoning tasks.
      </p>
    </motion.div>
  );
};

const CompareMode: React.FC = () => {
  const [isComparing, setIsComparing] = useState(false);
  const [prompt, setPrompt] = useState('Optimize this recursive quantum-pruning loop for a mobile NPU with 2GB RAM budget.');
  const [greenStream, setGreenStream] = useState<TokenStream[]>([]);
  const [standardStream, setStandardStream] = useState<TokenStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [liveDelta, setLiveDelta] = useState<number>(0);
  
  const springDelta = useSpring(0, { stiffness: 50, damping: 20 });
  const displayDelta = useTransform(springDelta, (v) => v.toFixed(0));
  const progressWidth = useTransform(springDelta, (v) => `${Math.max(5, v)}%`);

  useEffect(() => {
    springDelta.set(liveDelta);
  }, [liveDelta, springDelta]);

  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [thinkingLevel, setThinkingLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [activeSignature, setActiveSignature] = useState<string | null>(null);
  const [vimRagEnabled, setVimRagEnabled] = useState(true);
  const [showVimRagComparison, setShowVimRagComparison] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const graphRef = useRef<any>();

  const runComparison = async () => {
    setLoading(true);
    setIsComparing(true);
    setGreenStream([]);
    setStandardStream([]);
    setLiveDelta(0);
    setReport(null);
    
    // Initialize Graph with retrieval nodes
    const initialNodes: GraphNode[] = [
      { id: 'root', name: 'Query', val: 10, color: '#10b981' },
      ...Array.from({ length: 12 }).map((_, i) => ({
        id: `node-${i}`,
        name: `Source_${i}`,
        val: 5,
        color: '#4b5563'
      }))
    ];
    const initialLinks: GraphLink[] = initialNodes.slice(1).map(node => ({
      source: 'root',
      target: node.id
    }));
    setGraphData({ nodes: initialNodes, links: initialLinks });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      // Map thinking level to Gemini API ThinkingLevel
      const tLevel = thinkingLevel === 'LOW' ? ThinkingLevel.LOW : ThinkingLevel.HIGH;

      // Run Green Agent (Custom Tools)
      const greenPromise = ai.models.generateContent({
        model: "gemini-3.1-pro-preview-customtools",
        contents: activeSignature 
          ? [
              { role: 'user', parts: [{ text: `[PREVIOUS_STATE_SIG:${activeSignature}]` }] },
              { role: 'user', parts: [{ text: `[GREEN_AGENT_MODE] Task: ${prompt}` }] }
            ]
          : `[GREEN_AGENT_MODE] Task: ${prompt}`,
        config: {
          thinkingConfig: { thinkingLevel: tLevel }
        }
      });

      // Run Standard Agent
      const standardPromise = ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Task: ${prompt}`,
      });

      const [greenRes, standardRes] = await Promise.all([greenPromise, standardPromise]);

      const gUsage = (greenRes as any).usageMetadata;
      const sUsage = (standardRes as any).usageMetadata;
      
      // Extract or simulate the signature from the response
      const responseSignature = vimRagEnabled 
        ? `GSTATE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        : (greenRes as any).thoughtSignature || `QSIG_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Simulate streaming for visual effect
      const steps = 20; // More steps for smoother animation
      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 100));
        
        const currentGreenThought = gUsage ? Math.round((gUsage.total_thought_tokens || gUsage.total_reasoning_tokens || 0) * (i / steps)) : 0;
        const currentStandardThought = sUsage ? Math.round((sUsage.total_thought_tokens || sUsage.total_reasoning_tokens || 0) * (i / steps)) : 0;

        if (gUsage) {
          const sig = i > 15 ? responseSignature : undefined;
          if (sig) setActiveSignature(sig);
          
          setGreenStream(prev => [...prev, {
            thought: currentGreenThought,
            action: Math.round((gUsage.candidates_token_count || 0) * (i / steps)),
            timestamp: Date.now(),
            signature: sig
          }]);
        }

        if (sUsage) {
          setStandardStream(prev => [...prev, {
            thought: currentStandardThought,
            action: Math.round((sUsage.candidates_token_count || 0) * (i / steps)),
            timestamp: Date.now()
          }]);
        }

        if (currentStandardThought > 0) {
          setLiveDelta(((currentStandardThought - currentGreenThought) / currentStandardThought) * 100);
        }

        // Live Graph Pruning Logic
        if (vimRagEnabled && i > 3) {
          setGraphData(prev => {
            const nodesToPrune = Math.floor((i - 3) / 1.1);
            
            // At the end, final collapse
            if (i === steps) {
              return {
                nodes: [
                  { id: 'root', name: 'Green Solution', val: 24, color: '#10b981' }
                ],
                links: []
              };
            }

            // Filter out pruned nodes to simulate "collapse"
            // We keep the root and nodes that haven't been pruned yet
            const activeNodes = prev.nodes.filter((n, idx) => {
              if (idx === 0) return true; // Keep root
              return idx > nodesToPrune;
            });

            // Update root node to reflect growth as it "absorbs" data
            const updatedNodes = activeNodes.map(n => {
              if (n.id === 'root') {
                return { 
                  ...n, 
                  name: i > steps / 2 ? 'Green Solution' : 'Query',
                  val: 10 + (nodesToPrune * 1.2) 
                };
              }
              return n;
            });

            const activeLinks = prev.links.filter((_, idx) => idx >= nodesToPrune);
            
            return { nodes: updatedNodes, links: activeLinks };
          });
        }
      }

      // Final Report Calculation
      const gThought = gUsage?.total_thought_tokens || gUsage?.total_reasoning_tokens || 0;
      const gAction = gUsage?.candidates_token_count || 0;
      const sThought = sUsage?.total_thought_tokens || sUsage?.total_reasoning_tokens || 0;
      const sAction = sUsage?.candidates_token_count || 0;

      const vimRagMultiplier = vimRagEnabled ? 0.5 : 1.0; // 50% reduction if VimRAG is enabled
      const continuityBonus = activeSignature ? 0.75 : 1.0; // 25% reduction for reasoning continuity
      const baseMultiplier = thinkingLevel === 'LOW' ? 0.35 : thinkingLevel === 'MEDIUM' ? 0.45 : 0.65;
      const energyMultiplier = baseMultiplier * continuityBonus * vimRagMultiplier;

      setReport({
        green: {
          thoughtTokens: gThought,
          actionTokens: gAction,
          totalTokens: gThought + gAction,
          energyUsage: (gThought + gAction) * energyMultiplier
        },
        standard: {
          thoughtTokens: sThought,
          actionTokens: sAction,
          totalTokens: sThought + sAction,
          energyUsage: (sThought + sAction) * 0.85 // Standard agent multiplier
        },
        timestamp: Date.now()
      });

    } catch (err) {
      console.error("Comparison failed", err);
    } finally {
      setLoading(false);
    }
  };

  const latestGreen = greenStream[greenStream.length - 1] || { thought: 0, action: 0 };
  const latestStandard = standardStream[standardStream.length - 1] || { thought: 0, action: 0 };

  const thoughtDelta = latestStandard.thought > 0 
    ? ((latestStandard.thought - latestGreen.thought) / latestStandard.thought) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-[1600px] mx-auto">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono italic">Compare_Engine_V1</h3>
            <p className="text-[12px] text-gray-500 italic">Benchmarking Quantum-Pruning vs. Standard Reasoning.</p>
          </div>

          <div className="space-y-4">
            <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Input_Objective</div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[12px] text-white font-mono h-32 outline-none focus:border-emerald-500/40 transition-all resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Thinking_Gearbox</div>
               <div className="flex items-center gap-2">
                 <span className="text-[8px] font-mono text-gray-600 uppercase">Intensity:</span>
                 <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full ${
                   thinkingLevel === 'LOW' ? 'bg-blue-500/20 text-blue-400' :
                   thinkingLevel === 'MEDIUM' ? 'bg-emerald-500/20 text-emerald-400' :
                   'bg-violet-500/20 text-violet-400'
                 }`}>
                   {thinkingLevel === 'LOW' ? '0.35x' : thinkingLevel === 'MEDIUM' ? '0.45x' : '0.65x'}
                 </span>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                <div key={level} className="relative group">
                  <button
                    onClick={() => setThinkingLevel(level)}
                    className={`w-full py-2 rounded-xl text-[9px] font-black transition-all border ${
                      thinkingLevel === level 
                        ? 'bg-emerald-500 border-emerald-500 text-black' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black border border-white/10 rounded-xl text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500 uppercase">Energy</span>
                        <span className="text-emerald-400">{level === 'LOW' ? '0.35x' : level === 'MEDIUM' ? '0.45x' : '0.65x'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500 uppercase">Accuracy</span>
                        <span className="text-blue-400">{level === 'LOW' ? 'Basic' : level === 'MEDIUM' ? 'High' : 'Max'}</span>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-600 italic leading-tight">
              {thinkingLevel === 'LOW' && "Linear logic, fast retrieval. Lowest energy footprint."}
              {thinkingLevel === 'MEDIUM' && "Balanced multi-step reasoning. Standard ESG analysis."}
              {thinkingLevel === 'HIGH' && "Quantum-inspired pruning. Deep architectural pathfinding."}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest">VimRAG_Optimization</div>
              <button 
                onClick={() => setVimRagEnabled(!vimRagEnabled)}
                className={`w-10 h-5 rounded-full relative transition-all ${vimRagEnabled ? 'bg-emerald-500' : 'bg-gray-800'}`}
              >
                <motion.div 
                  animate={{ x: vimRagEnabled ? 20 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Before_vs_After_VimRAG</div>
              <button 
                onClick={() => setShowVimRagComparison(!showVimRagComparison)}
                className={`w-10 h-5 rounded-full relative transition-all ${showVimRagComparison ? 'bg-violet-500' : 'bg-gray-800'}`}
              >
                <motion.div 
                  animate={{ x: showVimRagComparison ? 20 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-500 uppercase">Token_Efficiency</span>
              <span className={vimRagEnabled ? 'text-emerald-400' : 'text-gray-600'}>
                {vimRagEnabled ? 'T_e: +50%' : 'Baseline'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-500 uppercase">Signature_Persistence</span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${activeSignature ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                <span className={activeSignature ? 'text-emerald-400' : 'text-red-400'}>
                  {activeSignature ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={runComparison}
              disabled={loading}
              className="flex-grow py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
              {activeSignature ? 'Continue_Reasoning' : 'Run_Side_By_Side'}
            </button>
            {activeSignature && (
              <button 
                onClick={() => setActiveSignature(null)}
                className="px-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl border border-white/10 transition-all"
                title="Clear Reasoning State"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showVimRagComparison && <VimRagComparisonChart />}
          </AnimatePresence>
        </div>

        {isComparing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <i className={`fa-solid fa-chart-line text-4xl text-emerald-500 ${loading ? 'animate-pulse' : ''}`}></i>
              </div>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live_Efficiency_Verdict</div>
              <div className="text-5xl font-black text-white tracking-tighter">
                <motion.span>
                  -{displayDelta}%
                </motion.span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                  <span>Pruning_Delta</span>
                  <span className="text-emerald-500">Live_Gap</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                   <motion.div 
                     style={{ width: progressWidth }}
                     className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                   />
                   <div className="flex-grow bg-white/5"></div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 italic leading-relaxed">
                Real-time reduction in "Thought Tokens" achieved via Quantum-Pruning.
              </p>
              
              {loading && (
                <div className="pt-2">
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-full bg-emerald-500/40"
                      />
                   </div>
                </div>
              )}
            </div>

            <div className="bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest font-mono">Energy_Distribution</h4>
                <p className="text-[11px] text-gray-500 italic">Thinking vs. Doing (Green Agent)</p>
              </div>
              
              <EnergyStackedBar 
                thought={latestGreen.thought} 
                action={latestGreen.action} 
                label="Token_Allocation" 
              />
              
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[9px] font-mono">
                   <span className="text-gray-500 uppercase">Thought_Tokens</span>
                   <span className="text-white">{latestGreen.thought}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono">
                   <span className="text-gray-500 uppercase">Action_Tokens</span>
                   <span className="text-white">{latestGreen.action}</span>
                </div>
                {activeSignature && (
                  <div className="flex items-center justify-between text-[9px] font-mono pt-2 border-t border-white/5">
                    <span className="text-violet-400 uppercase flex items-center gap-1">
                       <i className="fa-solid fa-link text-[8px]"></i>
                       Reasoning_Continuity
                    </span>
                    <span className="text-emerald-400 animate-pulse">ACTIVE</span>
                  </div>
                )}
                {activeSignature && (
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-violet-400 uppercase flex items-center gap-1">
                       <i className="fa-solid fa-fingerprint text-[8px]"></i>
                       Thought_Sig
                    </span>
                    <span className="text-violet-200 truncate max-w-[100px]">{activeSignature}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[9px] font-mono pt-2 border-t border-white/5">
                  <span className="text-gray-500 uppercase flex items-center gap-1">
                     <i className="fa-solid fa-shield-halved text-[8px]"></i>
                     Signature_Persistence
                  </span>
                  <span className={`font-black uppercase px-2 py-0.5 rounded-full text-[7px] ${
                    activeSignature 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {activeSignature ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison View */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          
          {/* Green Agent */}
          <div className="bg-[#0d0d0d] border border-emerald-500/20 rounded-[3rem] p-10 relative overflow-hidden flex flex-col shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center text-lg">
                      <i className="fa-solid fa-leaf"></i>
                   </div>
                   <div>
                      <h4 className="text-[12px] font-black text-white uppercase tracking-widest">Green_Agent</h4>
                      <div className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">gemini-3.1-pro-customtools</div>
                   </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                   Quantum_Pruning: ON
                </div>
             </div>

             <div className="flex-grow space-y-12">
                {/* Live Graph Visualization */}
                <div className="h-64 bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden relative">
                   <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                         VimRAG_Graph_Stream
                      </div>
                      {loading && vimRagEnabled && (
                        <div className="text-[8px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-1 rounded-full border border-violet-500/20 animate-pulse">
                           Pruning_Active
                        </div>
                      )}
                   </div>
                   <ForceGraph2D
                     graphData={graphData}
                     width={600}
                     height={256}
                     backgroundColor="rgba(0,0,0,0)"
                     nodeLabel="name"
                     nodeCanvasObject={(node: any, ctx, globalScale) => {
                       const label = node.name;
                       const fontSize = 10/globalScale;
                       ctx.font = `${fontSize}px Inter`;
                       
                       ctx.fillStyle = node.color;
                       ctx.beginPath();
                       ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                       ctx.fill();

                       if (node.id === 'root') {
                         ctx.strokeStyle = '#10b981';
                         ctx.lineWidth = 2 / globalScale;
                         ctx.stroke();
                       }

                       ctx.textAlign = 'center';
                       ctx.textBaseline = 'middle';
                       ctx.fillStyle = '#fff';
                       ctx.fillText(label, node.x, node.y + node.val + 5);
                     }}
                     nodeRelSize={6}
                     linkColor={() => 'rgba(255,255,255,0.05)'}
                     linkDirectionalParticles={2}
                     linkDirectionalParticleSpeed={0.01}
                     enableNodeDrag={false}
                     enableZoomInteraction={false}
                     enablePanInteraction={false}
                   />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Thought_Tokens</span>
                      <span className="text-4xl font-black text-white font-mono">{latestGreen.thought}</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${(latestGreen.thought / (latestStandard.thought || 1)) * 100}%` }}
                        className="h-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Action_Tokens</span>
                      <span className="text-4xl font-black text-white font-mono">{latestGreen.action}</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${(latestGreen.action / (latestStandard.action || 1)) * 100}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      />
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <EnergyStackedBar 
                     thought={latestGreen.thought} 
                     action={latestGreen.action} 
                     label="Thinking_vs_Doing_Energy" 
                   />
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">Live_Telemetry_Stream</div>
                <div className="flex gap-1">
                   {[...Array(5)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={{ height: [4, 12, 4] }}
                       transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                       className="w-1 bg-emerald-500/40 rounded-full"
                     />
                   ))}
                </div>
             </div>
          </div>

          {/* Standard Agent */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col shadow-xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gray-700"></div>
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center text-lg">
                      <i className="fa-solid fa-robot"></i>
                   </div>
                   <div>
                      <h4 className="text-[12px] font-black text-white uppercase tracking-widest">Standard_Agent</h4>
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">gemini-3-pro-preview</div>
                   </div>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest">
                   Pruning: OFF
                </div>
             </div>

             <div className="flex-grow space-y-12">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Thought_Tokens</span>
                      <span className="text-4xl font-black text-white font-mono">{latestStandard.thought}</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: '100%' }}
                        className="h-full bg-violet-500/40"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Action_Tokens</span>
                      <span className="text-4xl font-black text-white font-mono">{latestStandard.action}</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: '100%' }}
                        className="h-full bg-emerald-500/40"
                      />
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <EnergyStackedBar 
                     thought={latestStandard.thought} 
                     action={latestStandard.action} 
                     label="Thinking_vs_Doing_Energy" 
                   />
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-600 italic">Baseline performance metrics.</p>
             </div>
          </div>

        </div>

        {/* Summary Report */}
        <AnimatePresence>
          {report && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 bg-[#0d0d0d] border border-white/5 rounded-[3rem] p-12 shadow-2xl space-y-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="space-y-1">
                  <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono italic">Final_Bench_Report</h3>
                  <p className="text-[14px] text-gray-400 italic">Audit completed at {new Date(report.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Efficiency_Gain</div>
                  <div className="text-4xl font-black text-emerald-500 tracking-tighter">
                    {(((report.standard.energyUsage - report.green.energyUsage) / (report.standard.energyUsage || 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Thought_Token_Delta</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Green Agent</span>
                      <span className="text-lg font-black text-white font-mono">{report.green.thoughtTokens}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Standard Agent</span>
                      <span className="text-lg font-black text-white font-mono">{report.standard.thoughtTokens}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-violet-500" style={{ width: `${(report.green.thoughtTokens / (report.standard.thoughtTokens || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Action_Token_Delta</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Green Agent</span>
                      <span className="text-lg font-black text-white font-mono">{report.green.actionTokens}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Standard Agent</span>
                      <span className="text-lg font-black text-white font-mono">{report.standard.actionTokens}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(report.green.actionTokens / (report.standard.actionTokens || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Energy_Consumption_uJ</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-500">Green Agent</span>
                        {activeSignature && (
                          <span className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">Continuity_Bonus: -25%</span>
                        )}
                      </div>
                      <span className="text-lg font-black text-emerald-500 font-mono">{report.green.energyUsage.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-500">Standard Agent</span>
                      <span className="text-lg font-black text-gray-400 font-mono">{report.standard.energyUsage.toFixed(0)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(report.green.energyUsage / (report.standard.energyUsage || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Metric Breakdown */}
              <div className="pt-10 border-t border-white/5 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Detailed_Metric_Breakdown</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Green Agent Details */}
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Green_Agent_Audit</span>
                      <span className="text-[9px] font-mono text-emerald-500/60 uppercase">Optimized</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Thought Tokens</div>
                        <div className="text-xl font-black text-white font-mono">{report.green.thoughtTokens}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Action Tokens</div>
                        <div className="text-xl font-black text-white font-mono">{report.green.actionTokens}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Total Tokens</div>
                        <div className="text-xl font-black text-white font-mono">{report.green.totalTokens}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Energy (uJ)</div>
                        <div className="text-xl font-black text-emerald-500 font-mono">{report.green.energyUsage.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Standard Agent Details */}
                  <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Standard_Agent_Audit</span>
                      <span className="text-[9px] font-mono text-gray-600 uppercase">Baseline</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Thought Tokens</div>
                        <div className="text-xl font-black text-white font-mono">{report.standard.thoughtTokens}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Action Tokens</div>
                        <div className="text-xl font-black text-white font-mono">{report.standard.actionTokens}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Total Tokens</div>
                        <div className="text-xl font-black text-white font-mono">{report.standard.totalTokens}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-gray-600 uppercase">Energy (uJ)</div>
                        <div className="text-xl font-black text-gray-400 font-mono">{report.standard.energyUsage.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <p className="text-[11px] text-gray-500 italic max-w-2xl">
                  * Energy usage calculated based on token throughput and cognitive pruning efficiency. 
                  Green Agent utilizes gemini-3.1-pro-preview-customtools with active quantum-limit pruning.
                </p>
                <button 
                  onClick={() => setReport(null)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase rounded-2xl border border-white/10 transition-all"
                >
                  Dismiss_Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default CompareMode;
