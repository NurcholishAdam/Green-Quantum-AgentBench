
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
  const [budget, setBudget] = useState(5.0); // Default 5.0g budget

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
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Carbon_Budget_Cap (g CO2)</label>
             <div className="flex items-center gap-6">
                <input 
                  type="range" 
                  min="0.5" 
                  max="10.0" 
                  step="0.5" 
                  value={budget} 
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="flex-grow h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-xl font-black text-emerald-400 font-mono w-20 text-right">{budget.toFixed(1)}g</span>
             </div>
             
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 block pt-4">Target_Task_Payload</label>
             <textarea 
               value={task}
               onChange={(e) => setTask(e.target.value)}
               className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-sm text-emerald-400 font-mono h-24 outline-none focus:border-emerald-500/40 transition-all shadow-inner"
             />
          </div>
          
          <div className="w-full md:w-64">
             <button 
               onClick={handleGeneratePlan}
               disabled={loading}
               className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 h-full"
             >
               {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-scale-balanced"></i>}
               {loading ? 'Trading...' : 'Execute Carbon-Trade'}
             </button>
          </div>
        </div>

        {plan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-8">
            <div className="lg:col-span-4 space-y-6">
               <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem]">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 border-b border-emerald-500/10 pb-2">Trading_Ledger</h4>
                  <div className="space-y-6">
                    <div>
                      <div className="text-[8px] text-gray-600 uppercase font-black mb-1">Carbon_Equilibrium</div>
                      <div className={`text-4xl font-black tracking-tighter ${plan.totalEstimatedCarbon > budget ? 'text-red-500' : 'text-white'}`}>
                        {plan.totalEstimatedCarbon.toFixed(2)}g
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-600 uppercase font-black mb-2">Budget_Utilization</div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-1000 ${plan.totalEstimatedCarbon > budget ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500'}`} 
                           style={{ width: `${Math.min(100, (plan.totalEstimatedCarbon / budget) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                       <div className="text-[8px] text-emerald-500 font-black uppercase mb-1 tracking-widest">Adaptation_Triggered</div>
                       <p className="text-[11px] text-gray-400 font-serif italic leading-relaxed">
                          "{plan.adaptationStrategy}"
                       </p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">Agent_Assignment_Chain</h4>
               {plan.subtasks.map((st) => {
                 const agent = MOCK_AGENTS.find(a => a.id === st.assignedAgentId);
                 return (
                   <div key={st.id} className="group p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 font-mono text-xs font-black group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
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
