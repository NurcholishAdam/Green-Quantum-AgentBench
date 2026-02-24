
import React from 'react';
import { motion } from 'motion/react';

interface Props {
  thoughtTokens: number;
  completionTokens: number;
}

const ThoughtTokensGraph: React.FC<Props> = ({ thoughtTokens, completionTokens }) => {
  const total = thoughtTokens + completionTokens || 1;
  const thoughtPct = (thoughtTokens / total) * 100;
  const completionPct = (completionTokens / total) * 100;

  return (
    <div className="bg-[#0d0d0d] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] font-mono italic">Thinking_vs_Doing</h4>
          <p className="text-[12px] text-gray-500 italic">Energy distribution across cognitive cycles.</p>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Total_Tokens</div>
          <div className="text-2xl font-black text-white font-mono">{total}</div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative h-12 bg-white/5 rounded-2xl overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${thoughtPct}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 relative group"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            {thoughtPct > 10 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Thought_Layer</span>
              </div>
            )}
          </motion.div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative"
          >
             {completionPct > 10 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-black uppercase tracking-tighter">Action_Layer</span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3 p-6 bg-violet-500/5 border border-violet-500/10 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Thought_Tokens</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{thoughtTokens}</span>
              <span className="text-[10px] text-gray-600 font-mono">({thoughtPct.toFixed(1)}%)</span>
            </div>
            <p className="text-[10px] text-gray-500 italic leading-relaxed">
              High-level reasoning used to arrive at a "Green" decision.
            </p>
          </div>

          <div className="space-y-3 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Action_Tokens</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{completionTokens}</span>
              <span className="text-[10px] text-gray-600 font-mono">({completionPct.toFixed(1)}%)</span>
            </div>
            <p className="text-[10px] text-gray-500 italic leading-relaxed">
              Final output tokens used for task execution.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Efficiency_Verified</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Quantum_Pruning_Active</span>
           </div>
        </div>
        <div className="text-[9px] font-mono text-gray-700 italic">
          Model: gemini-3.1-pro-preview-customtools
        </div>
      </div>
    </div>
  );
};

export default ThoughtTokensGraph;
