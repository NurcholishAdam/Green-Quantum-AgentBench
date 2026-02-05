
import React, { useState } from 'react';
import { getSupervisorPlan, refineGreenPrompt } from '../services/geminiService';
import { AgentBenchmark, HardwareType, OrchestrationPlan, GreenRefinement } from '../types';
import { MOCK_AGENTS } from '../constants';

interface Props {
  hwType: HardwareType;
}

const OrchestratorView: React.FC<Props> = ({ hwType }) => {
  const [task, setTask] = useState('Generate a comprehensive cross-cluster semantic audit report with 5000 word depth.');
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [refinement, setRefinement] = useState<GreenRefinement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [budget, setBudget] = useState(5.0);

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      const result = await refineGreenPrompt(task);
      setRefinement(result);
    } finally {
      setIsRefining(false);
    }
  };

  const applyRefinement = () => {
    if (refinement) {
      setTask(refinement.refinedPrompt);
      setRefinement(null);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await getSupervisorPlan(task, MOCK_AGENTS, hwType, budget);
      setPlan(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 mt-12 animate-in fade-in duration-700">
      
      {/* Interactive Green Refiner Overlay/Section */}
      <div className={`bg-[#0d0d0d] border rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 ${refinement ? 'border-emerald-500/40 ring-4 ring-emerald-500/5' : 'border-white/5'}`}>
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
             <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono">Sustainability_Consultant_v1</h3>
             <p className="text-[12px] text-gray-500 italic">Intercepting and optimizing semantic intent for minimal entropy.</p>
           </div>
           {!refinement && (
             <button 
               onClick={handleRefine}
               disabled={isRefining}
               className="px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase rounded-xl transition-all"
             >
               {isRefining ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-leaf mr-2"></i>}
               Refine_Prompt
             </button>
           )}
        </div>

        {refinement ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-top-4">
             <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40"></div>
                   <div className="text-[9px] font-black text-gray-500 uppercase mb-3">Original_Intent</div>
                   <p className="text-xs text-gray-400 line-through opacity-50">{refinement.originalPrompt}</p>
                </div>
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                   <div className="text-[9px] font-black text-emerald-500 uppercase mb-3 italic">Refined_Green_Path</div>
                   <p className="text-sm text-white font-mono leading-relaxed">{refinement.refinedPrompt}</p>
                </div>
             </div>
             <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl font-black">
                         {refinement.estimatedSavings}
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-white uppercase tracking-widest">Projected_Savings</div>
                         <div className="text-[11px] text-gray-500 italic">Reduction in redundant generation cycles.</div>
                      </div>
                   </div>
                   <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Consultant_Notes</div>
                      <p className="text-[11px] text-gray-400 font-serif italic">{refinement.reasoning}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={applyRefinement} className="flex-grow py-4 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 transition-all">Accept_Optimization</button>
                   <button onClick={() => setRefinement(null)} className="px-6 py-4 bg-white/5 text-gray-500 text-[10px] font-black uppercase rounded-xl hover:text-white transition-all">Ignore</button>
                </div>
             </div>
          </div>
        ) : (
          <textarea 
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-[1.5rem] p-8 text-sm text-emerald-400 font-mono h-28 outline-none focus:border-emerald-500/40 transition-all"
            placeholder="Describe your agentic task..."
          />
        )}
      </div>

      <div className="flex justify-center">
         <button 
           onClick={handleGeneratePlan}
           disabled={loading || !!refinement}
           className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-4"
         >
           {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-scale-balanced"></i>}
           Execute_Carbon_Aware_Dispatch
         </button>
      </div>

      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8">
          
          {/* Marginal Savings Ledger Card */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                   <i className="fa-solid fa-money-bill-trend-up text-6xl text-emerald-500"></i>
                </div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 border-b border-emerald-500/10 pb-4 italic">Marginal_Savings_Ledger</h4>
                
                <div className="space-y-10">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                         <div className="text-[9px] font-black text-gray-600 uppercase">Legacy_Baseline</div>
                         <div className="text-2xl font-black text-gray-500 font-mono line-through opacity-40">{plan.marginalSavings?.legacyFootprint.toFixed(2)}g</div>
                      </div>
                      <div className="text-right space-y-1">
                         <div className="text-[9px] font-black text-emerald-500 uppercase">Quantum_Green_Path</div>
                         <div className="text-4xl font-black text-white tracking-tighter font-mono">{plan.totalEstimatedCarbon.toFixed(2)}g</div>
                      </div>
                   </div>

                   <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center relative overflow-hidden">
                      <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total_Carbon_Avoidance</div>
                      <div className="text-5xl font-black text-white tracking-tighter mb-2">-{plan.marginalSavings?.savingsGrams.toFixed(2)}g</div>
                      <div className="text-[10px] font-mono text-emerald-500/60 uppercase">({plan.marginalSavings?.percentage}% Optimized Efficiency)</div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                         <div className="text-[8px] font-black text-gray-600 uppercase mb-1 italic">Trees_Equivalent</div>
                         <div className="text-sm font-black text-white">0.02 Trees/Hr</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                         <div className="text-[8px] font-black text-gray-600 uppercase mb-1 italic">Grid_Relief_Index</div>
                         <div className="text-sm font-black text-white">High</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-4">
                <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Supervisor_Reasoning</h5>
                <p className="text-[12px] text-gray-400 font-serif italic leading-relaxed">"{plan.reasoning}"</p>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
             <div className="flex items-center justify-between px-4 mb-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Assignment_Pipeline_v25</h4>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Credits_Used
                   </div>
                   <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase font-bold">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Shadow_Audit
                   </div>
                </div>
             </div>
             {plan.subtasks.map((st) => {
               const agent = MOCK_AGENTS.find(a => a.id === st.assignedAgentId);
               return (
                 <div key={st.id} className="group p-8 bg-[#0d0d0d] border border-white/5 rounded-[2rem] flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-xl">
                    <div className="flex items-center gap-8">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 font-mono text-sm font-black group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all shadow-inner">
                         {st.id}
                      </div>
                      <div>
                         <div className="flex items-center gap-4 mb-1">
                            <div className="text-[13px] font-black text-white uppercase tracking-wider">{st.label}</div>
                            {st.adaptationMode && (
                              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black rounded-lg uppercase tracking-tighter italic">
                                {st.adaptationMode}
                              </span>
                            )}
                         </div>
                         <div className="text-[11px] text-gray-600 font-mono italic">Shadow_Cost_Delta: -{(st.estimatedCarbon * 0.4).toFixed(3)}g</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                       <div className="text-[9px] font-black text-gray-700 uppercase">Impact_Net</div>
                       <div className="text-xl font-black font-mono text-emerald-500">{st.estimatedCarbon.toFixed(3)}g</div>
                       <div className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest italic">{agent?.name}</div>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrchestratorView;
