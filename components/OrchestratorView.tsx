
import React, { useState } from 'react';
import { getSupervisorPlan, refineGreenPrompt } from '../services/geminiService';
import { AgentBenchmark, HardwareType, OrchestrationPlan, GreenRefinement } from '../types';
import { MOCK_AGENTS } from '../constants';

interface Props {
  hwType: HardwareType;
}

const OrchestratorView: React.FC<Props> = ({ hwType }) => {
  const [task, setTask] = useState('Verify cross-cluster semantic consistency and generate a detailed report with full inference lineage.');
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
    <div className="space-y-12 mt-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-24">
      
      {/* Interactive Green Refiner / Consultant Widget */}
      <div className={`bg-[#0d0d0d] border rounded-[3rem] p-12 shadow-2xl transition-all duration-700 relative overflow-hidden ${refinement ? 'border-emerald-500/40 ring-4 ring-emerald-500/5' : 'border-white/5'}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-transparent to-transparent opacity-20"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
           <div className="space-y-2 text-center md:text-left">
             <h3 className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono flex items-center gap-4 justify-center md:justify-start">
               <i className="fa-solid fa-wand-magic-sparkles"></i>
               Sustainability_Consultant_v1.2
             </h3>
             <p className="text-[14px] text-gray-500 italic max-w-md">Analyzing semantic intent to optimize hardware-level entropy.</p>
           </div>
           
           {!refinement && (
             <button 
               onClick={handleRefine}
               disabled={isRefining}
               className="px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[11px] font-black uppercase rounded-2xl transition-all flex items-center gap-3 shadow-xl active:scale-95"
             >
               {isRefining ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-leaf"></i>}
               {isRefining ? 'Analyzing Intent...' : 'Refine_Green_Prompt'}
             </button>
           )}
        </div>

        {refinement ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-top-6">
             <div className="space-y-8">
                <div className="p-8 bg-black/60 border border-white/5 rounded-3xl relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/40 opacity-40"></div>
                   <div className="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest italic">Original_Energy_Intent</div>
                   <p className="text-[13px] text-gray-500 line-through opacity-60 italic leading-relaxed">{refinement.originalPrompt}</p>
                </div>
                <div className="p-8 bg-emerald-950/10 border border-emerald-500/30 rounded-3xl relative overflow-hidden shadow-2xl group">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                   <div className="text-[10px] font-black text-emerald-500 uppercase mb-4 tracking-widest italic flex items-center gap-3">
                      <i className="fa-solid fa-sparkles"></i>
                      Optimized_Sustainability_Path
                   </div>
                   <p className="text-[15px] text-white font-mono leading-relaxed font-bold">{refinement.refinedPrompt}</p>
                </div>
             </div>
             
             <div className="space-y-10 flex flex-col justify-between py-2">
                <div className="space-y-8">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 text-white flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/20">
                         <span className="text-2xl font-black">{refinement.estimatedSavings.replace('%', '')}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest">% SAVED</span>
                      </div>
                      <div className="space-y-1">
                         <div className="text-[11px] font-black text-white uppercase tracking-widest">Projected_Utility_Gain</div>
                         <p className="text-[12px] text-gray-500 italic max-w-xs leading-relaxed">Optimization triggers recursive credit trades between agents to maintain task completion within budget.</p>
                      </div>
                   </div>
                   <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <i className="fa-solid fa-brain text-5xl"></i>
                      </div>
                      <div className="text-[11px] font-black text-gray-600 uppercase mb-3 tracking-widest italic">Consultant_Heuristics</div>
                      <p className="text-[12px] text-gray-400 font-serif italic leading-relaxed border-l-2 border-emerald-500/20 pl-6">{refinement.reasoning}</p>
                   </div>
                </div>
                
                <div className="flex gap-6">
                   <button onClick={applyRefinement} className="flex-grow py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                      <i className="fa-solid fa-check"></i>
                      Apply_Sustainability_Path
                   </button>
                   <button onClick={() => setRefinement(null)} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white text-[11px] font-black uppercase rounded-2xl border border-white/10 transition-all active:scale-95">
                      Ignore_Optimization
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="relative group">
            <textarea 
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-[2rem] p-10 text-[15px] text-emerald-400 font-mono h-36 outline-none focus:border-emerald-500/40 transition-all shadow-inner placeholder:text-gray-800"
              placeholder="Inject your core semantic objective for carbon-aware dispatch..."
            />
            <div className="absolute bottom-4 right-4 opacity-20 text-[9px] font-mono uppercase font-black text-gray-600 group-hover:opacity-60 transition-opacity">
              Live_Intent_Monitoring_Active
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 py-4">
         <div className="flex items-center gap-12 bg-white/5 border border-white/5 p-4 rounded-[2rem] backdrop-blur-md">
            <div className="flex flex-col items-center">
               <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Carbon_Budget_Limit</span>
               <div className="flex items-center gap-6 px-4">
                  <input 
                    type="range" 
                    min="1.0" 
                    max="15.0" 
                    step="0.5" 
                    value={budget} 
                    onChange={(e) => setBudget(parseFloat(e.target.value))}
                    className="w-48 h-1 bg-gray-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xl font-black text-white font-mono w-16 text-right tracking-tighter">{budget.toFixed(1)}g</span>
               </div>
            </div>
         </div>
         
         <button 
           onClick={handleGeneratePlan}
           disabled={loading || !!refinement}
           className="px-16 py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-gray-700 text-white font-black text-[13px] uppercase tracking-[0.4em] rounded-[2rem] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center gap-6 italic"
         >
           {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-scale-balanced"></i>}
           {loading ? 'Trading Credits...' : 'Execute_Carbon_Dispatch'}
         </button>
      </div>

      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-10">
          
          {/* Marginal Savings Ledger Card */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-[#111] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                   <i className="fa-solid fa-money-bill-trend-up text-7xl text-emerald-500"></i>
                </div>
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-12 border-b border-emerald-500/10 pb-4 italic">Marginal_Savings_Ledger</h4>
                
                <div className="space-y-12">
                   <div className="flex justify-between items-end px-2">
                      <div className="space-y-1">
                         <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Legacy_Baseline</div>
                         <div className="text-2xl font-black text-gray-500 font-mono line-through opacity-30">{plan.marginalSavings?.legacyFootprint.toFixed(2)}g</div>
                      </div>
                      <div className="text-right space-y-1">
                         <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Quantum_Green_Dispatch</div>
                         <div className="text-5xl font-black text-white tracking-tighter font-mono">{plan.totalEstimatedCarbon.toFixed(2)}g</div>
                      </div>
                   </div>

                   <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] text-center relative overflow-hidden group shadow-2xl">
                      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 font-mono">Realized_Avoidance_Delta</div>
                      <div className="text-6xl font-black text-white tracking-tighter mb-4">-{plan.marginalSavings?.savingsGrams.toFixed(2)}g</div>
                      <div className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-widest italic opacity-60">
                         {plan.marginalSavings?.percentage}% Relative Gain Efficiency
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6 px-2">
                      <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                         <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Trees_Eq</div>
                         <div className="text-lg font-black text-white">0.05/Hr</div>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl text-center space-y-1">
                         <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Grid_Relief</div>
                         <div className="text-lg font-black text-white">OPTIMAL</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] space-y-6 shadow-xl">
                <h5 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 italic">
                  <i className="fa-solid fa-brain"></i>
                  Supervisor_Logic_Summary
                </h5>
                <p className="text-[14px] text-gray-400 font-serif italic leading-relaxed border-l-2 border-emerald-500/20 pl-8">
                  "{plan.reasoning}"
                </p>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-8 mb-4">
                <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] italic">Assignment_Pipeline_v28</h4>
                <div className="flex gap-8">
                   <div className="flex items-center gap-3 text-[10px] text-gray-700 uppercase font-black tracking-widest">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      CREDITS_ACTIVE
                   </div>
                   <div className="flex items-center gap-3 text-[10px] text-gray-700 uppercase font-black tracking-widest">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                      SHADOW_AUDIT_OK
                   </div>
                </div>
             </div>
             
             {plan.subtasks.map((st) => {
               const agent = MOCK_AGENTS.find(a => a.id === st.assignedAgentId);
               return (
                 <div key={st.id} className="group p-10 bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-all"></div>
                    <div className="flex items-center gap-10 relative z-10">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-gray-700 font-mono text-lg font-black group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all shadow-inner border border-white/5">
                         {st.id}
                      </div>
                      <div>
                         <div className="flex items-center gap-6 mb-2">
                            <div className="text-[16px] font-black text-white uppercase tracking-tight italic">{st.label}</div>
                            {st.adaptationMode && (
                              <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black rounded-xl uppercase tracking-tighter italic shadow-lg shadow-blue-500/5">
                                {st.adaptationMode}
                              </span>
                            )}
                         </div>
                         <div className="text-[12px] text-gray-600 font-mono italic flex items-center gap-3">
                            <span className="text-emerald-500/60 font-black tracking-widest uppercase">Shadow_Audit_Delta:</span> 
                            -{(st.estimatedCarbon * 0.55).toFixed(3)}g Saved vs Standard
                         </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1 relative z-10">
                       <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Impact_Score</div>
                       <div className="text-3xl font-black font-mono text-emerald-500 tracking-tighter">{st.estimatedCarbon.toFixed(3)}g</div>
                       <div className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest italic">{agent?.name}</div>
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
