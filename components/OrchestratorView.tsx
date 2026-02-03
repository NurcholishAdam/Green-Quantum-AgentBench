
import React, { useState } from 'react';
import { getSupervisorPlan } from '../services/geminiService';
import { AgentBenchmark, HardwareType, OrchestrationPlan } from '../types';
import { MOCK_AGENTS } from '../constants';

interface Props {
  hwType: HardwareType;
}

const OrchestratorView: React.FC<Props> = ({ hwType }) => {
  const [task, setTask] = useState('Verify cross-cluster semantic consistency and prune dormant neurons.');
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(5.0); // Default 5g budget

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
      <div className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 opacity-20"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
          <div className="flex-grow space-y-3 w-full">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Objective_Handshake_Prompt</label>
             <textarea 
               value={task}
               onChange={(e) => setTask(e.target.value)}
               className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-sm text-emerald-400 font-mono h-24 outline-none focus:border-emerald-500/40 transition-all shadow-inner"
             />
          </div>
          
          <div className="space-y-4 w-full md:w-64">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Carbon_Budget_Limit (g)</label>
             <input 
               type="range" 
               min="1" 
               max="10" 
               step="0.5" 
               value={budget} 
               onChange={(e) => setBudget(parseFloat(e.target.value))}
               className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
             />
             <div className="flex justify-between items-center text-[11px] font-mono text-white px-2">
                <span>1.0g</span>
                <span className="text-emerald-500 font-black">{budget.toFixed(1)}g</span>
                <span>10.0g</span>
             </div>
             
             <button 
               onClick={handleGeneratePlan}
               disabled={loading}
               className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 h-16"
             >
               {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-scale-balanced"></i>}
               {loading ? 'Trading...' : 'Execute Carbon-Trade'}
             </button>
          </div>
        </div>

        {plan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-8">
            <div className="lg:col-span-4 space-y-6">
               <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Trading_Equilibrium</h4>
                  <div className="flex items-end gap-3 mb-1">
                    <div className={`text-4xl font-black tracking-tighter ${plan.totalEstimatedCarbon > budget ? 'text-red-500' : 'text-white'}`}>
                      {plan.totalEstimatedCarbon.toFixed(2)}g
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold mb-1 uppercase">Estimated</div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                     <div 
                        className={`h-full transition-all duration-1000 ${plan.totalEstimatedCarbon > budget ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(100, (plan.totalEstimatedCarbon / budget) * 100)}%` }}
                     ></div>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest mb-2">Adaptation_Strategy:</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-serif italic border-l-2 border-emerald-500/30 pl-4">
                    "{plan.adaptationStrategy}"
                  </p>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Adaptive_Task_Chain</h4>
               {plan.subtasks.map((st) => {
                 const agent = MOCK_AGENTS.find(a => a.id === st.assignedAgentId);
                 return (
                   <div key={st.id} className="group p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 font-mono text-xs font-black">
                           {st.id}
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <div className="text-[10px] font-black text-white uppercase tracking-widest">{st.label}</div>
                              {st.adaptationMode && (
                                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black rounded uppercase">
                                  {st.adaptationMode}
                                </span>
                              )}
                           </div>
                           <div className="text-[11px] text-gray-500 italic">Executor: {agent?.name || 'Unknown'}</div>
                        </div>
                      </div>
                      <div className="flex gap-8 text-right">
                         <div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Budget_Impact</div>
                            <div className="text-xs font-mono text-amber-500 font-bold">{st.estimatedCarbon.toFixed(3)}g</div>
                         </div>
                         {st.scope3Penalty > 0 && (
                           <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <div className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Scope_3</div>
                              <div className="text-[10px] font-mono text-red-500 font-bold">+{st.scope3Penalty}g</div>
                           </div>
                         )}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrchestratorView;
