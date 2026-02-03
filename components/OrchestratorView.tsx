
import React, { useState } from 'react';
import { getSupervisorPlan } from '../services/geminiService';
import { AgentBenchmark, HardwareType, OrchestrationPlan } from '../types';
import { MOCK_AGENTS } from '../constants';

interface Props {
  hwType: HardwareType;
}

const OrchestratorView: React.FC<Props> = ({ hwType }) => {
  const [task, setTask] = useState('Deep-scan provenance logs and verify QEC fidelity across edge clusters.');
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await getSupervisorPlan(task, MOCK_AGENTS, hwType);
      setPlan(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 mt-12 animate-in fade-in duration-700">
      <div className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 opacity-20"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
          <div className="flex-grow space-y-3">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Objective_Handshake_Prompt</label>
             <textarea 
               value={task}
               onChange={(e) => setTask(e.target.value)}
               className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-sm text-emerald-400 font-mono h-24 outline-none focus:border-emerald-500/40 transition-all shadow-inner"
             />
          </div>
          <button 
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-3 h-24"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-network-wired"></i>}
            {loading ? 'Consulting Supervisor...' : 'Initialize Carbon-Aware Orchestration'}
          </button>
        </div>

        {plan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-8">
            <div className="lg:col-span-4 space-y-6">
               <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Supervisor_Summary</h4>
                  <div className="text-4xl font-black text-white tracking-tighter mb-1">{plan.totalEstimatedCarbon}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-6">Total_Est_Plan_Carbon (gCO2eq)</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-serif italic border-l-2 border-emerald-500/30 pl-4">
                    "{plan.reasoning}"
                  </p>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-4">SubTask_Chain_Assignment</h4>
               {plan.subtasks.map((st) => {
                 const agent = MOCK_AGENTS.find(a => a.id === st.assignedAgentId);
                 return (
                   <div key={st.id} className="group p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 font-mono text-xs font-black">
                           {st.id}
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-white uppercase tracking-widest">{st.label}</div>
                           <div className="text-[11px] text-gray-500 italic">Assigned: {agent?.name || 'Unknown'}</div>
                        </div>
                      </div>
                      <div className="flex gap-8 text-right">
                         <div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Energy</div>
                            <div className="text-xs font-mono text-amber-500 font-bold">{st.estimatedEnergy}uJ</div>
                         </div>
                         <div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">Carbon</div>
                            <div className="text-xs font-mono text-blue-500 font-bold">{st.estimatedCarbon}g</div>
                         </div>
                         {st.scope3Penalty > 0 && (
                           <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <div className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Scope_3_Penalty</div>
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
