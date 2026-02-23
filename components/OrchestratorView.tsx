
import React, { useState, useEffect, useMemo } from 'react';
import { getSupervisorPlan, refineGreenPrompt, getRegionalCarbonIntensity } from '../services/geminiService';
import { AgentBenchmark, HardwareType, OrchestrationPlan, GreenRefinement, GridContext } from '../types';
import { MOCK_AGENTS } from '../constants';

interface Props {
  hwType: HardwareType;
}

const OrchestratorView: React.FC<Props> = ({ hwType }) => {
  const [task, setTask] = useState('Conduct a cross-script semantic audit and verify QEC stability across H100 clusters.');
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [grid, setGrid] = useState<GridContext | null>(null);
  const [refinement, setRefinement] = useState<GreenRefinement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showEcoIntercept, setShowEcoIntercept] = useState(false);
  const [budget, setBudget] = useState(5.0);

  // Initialize Grid Data for Throttling
  useEffect(() => {
    const fetchGrid = async () => {
      try {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const data = await getRegionalCarbonIntensity(pos.coords.latitude, pos.coords.longitude);
            setGrid(data);
          }, async () => {
            const data = await getRegionalCarbonIntensity();
            setGrid(data);
          });
        } else {
          const data = await getRegionalCarbonIntensity();
          setGrid(data);
        }
      } catch (err) {
        console.error("Grid Audit Failed", err);
      }
    };
    fetchGrid();
    const interval = setInterval(fetchGrid, 120000); // Check every 2 minutes
    return () => clearInterval(interval);
  }, []);

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

  const isGridDirty = useMemo(() => grid?.status === 'Dirty', [grid]);

  const handleGeneratePlan = async () => {
    if (!refinement && !showEcoIntercept) {
      setShowEcoIntercept(true);
      handleRefine();
      return;
    }

    setLoading(true);
    // Explicitly inject Eco-Mode instructions if grid is dirty to ensure Gemini prioritizes pruning
    const augmentedTask = isGridDirty 
      ? `[ECO-MODE OVERRIDE: GRID INTENSITY HIGH] ${task}`
      : task;

    try {
      const result = await getSupervisorPlan(augmentedTask, MOCK_AGENTS, hwType, budget, grid || undefined);
      setPlan(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 mt-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-24 px-4">
      
      {/* Dynamic Grid Status Banner with Eco-Mode Indicator */}
      <div className={`transition-all duration-700 p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden ${
        isGridDirty 
          ? 'bg-red-500/10 border-red-500/30 ring-4 ring-red-500/5' 
          : 'bg-emerald-500/5 border-emerald-500/20'
      }`}>
         <div className="flex items-center gap-6 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
              isGridDirty ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}>
               <i className={`fa-solid ${isGridDirty ? 'fa-radiation' : 'fa-leaf'}`}></i>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${isGridDirty ? 'text-red-500' : 'text-emerald-500'}`}>
                    Regional_Grid_Status: {grid?.status || 'Analyzing...'}
                  </h4>
                  {isGridDirty && (
                    <span className="px-3 py-1 bg-red-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest animate-bounce">
                      Eco-Mode Active
                    </span>
                  )}
               </div>
               <p className="text-[14px] text-white font-black tracking-tight">
                 Intensity: <span className={isGridDirty ? 'text-red-500' : 'text-emerald-500'}>{grid?.intensity || '---'} gCO2/kWh</span>
                 <span className="text-[10px] text-gray-600 ml-3 font-mono">Location: {grid?.region || 'Global Node'}</span>
               </p>
            </div>
         </div>
         
         <div className="flex items-center gap-8 relative z-10">
            <div className="hidden lg:block text-right">
               <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Grid_Source</div>
               <div className="text-[10px] font-mono text-gray-400">Gemini-3-Flash Real-time Audit</div>
            </div>
            <div className={`w-px h-10 ${isGridDirty ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}></div>
            <div className="text-right">
               <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Recommended_Action</div>
               <div className={`text-[10px] font-black uppercase tracking-widest ${isGridDirty ? 'text-red-400' : 'text-emerald-400'}`}>
                 {isGridDirty ? 'Max Pruning // Min Tokens' : 'Optimal Path Enabled'}
               </div>
            </div>
         </div>
      </div>

      {/* Orchestrator Configuration Interface */}
      <div className={`bg-[#0d0d0d] border rounded-[3.5rem] p-12 shadow-2xl transition-all duration-700 relative overflow-hidden ${
        refinement ? 'border-emerald-500/40 ring-4 ring-emerald-500/5' : 'border-white/5'
      }`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-transparent to-transparent opacity-20"></div>
        
        {showEcoIntercept && refinement && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-12 animate-in fade-in duration-500">
            <div className="max-w-xl w-full bg-[#0d0d0d] border border-emerald-500/30 p-10 rounded-[3rem] shadow-2xl space-y-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl text-emerald-500 mx-auto">
                <i className="fa-solid fa-leaf"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white tracking-tight">Eco-Optimization Detected</h3>
                <p className="text-gray-400 text-[15px] leading-relaxed">
                  "If I simplify this query, I can save <span className="text-emerald-500 font-bold">{refinement.estimatedSavings} energy</span> with <span className="text-blue-400 font-bold">98% the same accuracy</span>. Shall I proceed?"
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { applyRefinement(); setShowEcoIntercept(false); }}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Proceed with Eco-Optimization
                </button>
                <button 
                  onClick={() => { setShowEcoIntercept(false); handleGeneratePlan(); }}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-gray-500 text-[11px] font-black uppercase rounded-2xl transition-all"
                >
                  Continue with Original (High Energy)
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
           <div className="space-y-2 text-center md:text-left">
             <h3 className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono flex items-center gap-4 justify-center md:justify-start">
               <i className="fa-solid fa-sparkles"></i>
               Orchestrator_Config_V3
             </h3>
             <p className="text-[14px] text-gray-500 italic max-w-md">Multi-agent dispatch with carbon-aware sub-tasking.</p>
           </div>
           
           {!refinement && (
             <button 
               onClick={handleRefine}
               disabled={isRefining || loading}
               className="px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[11px] font-black uppercase rounded-2xl transition-all flex items-center gap-3 shadow-xl"
             >
               {isRefining ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-leaf"></i>}
               Scan_For_Green_Refinement
             </button>
           )}
        </div>

        {refinement ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-top-6">
             <div className="space-y-8">
                <div className="p-8 bg-black/60 border border-white/5 rounded-3xl relative overflow-hidden group">
                   <div className="text-[10px] font-black text-gray-700 uppercase mb-4 tracking-widest italic">Current_Task</div>
                   <p className="text-[13px] text-gray-500 line-through opacity-60 italic leading-relaxed">{refinement.originalPrompt}</p>
                </div>
                <div className="p-8 bg-emerald-950/10 border border-emerald-500/30 rounded-3xl relative overflow-hidden shadow-2xl group">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                   <div className="text-[10px] font-black text-emerald-500 uppercase mb-4 tracking-widest italic">Green_Refinement_Applied</div>
                   <p className="text-[15px] text-white font-mono leading-relaxed font-bold">{refinement.refinedPrompt}</p>
                </div>
             </div>
             
             <div className="space-y-10 flex flex-col justify-between py-2">
                <div className="space-y-8">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                         <span className="text-2xl font-black">{refinement.estimatedSavings.replace('%', '')}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest">% OFF</span>
                      </div>
                      <div className="space-y-1">
                         <div className="text-[11px] font-black text-white uppercase tracking-widest">Efficiency_Gain</div>
                         <p className="text-[12px] text-gray-500 italic max-w-xs leading-relaxed">Prompt refinement eliminates semantic redundancy for better S-Score density.</p>
                      </div>
                   </div>
                   <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] shadow-inner">
                      <div className="text-[11px] font-black text-gray-600 uppercase mb-3 tracking-widest italic">Reasoning</div>
                      <p className="text-[12px] text-gray-400 font-serif italic leading-relaxed">{refinement.reasoning}</p>
                   </div>
                </div>
                
                <div className="flex gap-6">
                   <button onClick={applyRefinement} className="flex-grow py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                      Accept_Optimization
                   </button>
                   <button onClick={() => setRefinement(null)} className="px-10 py-5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white text-[11px] font-black uppercase rounded-2xl border border-white/10 transition-all">
                      Discard
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            <textarea 
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-[2rem] p-10 text-[15px] text-emerald-400 font-mono h-36 outline-none focus:border-emerald-500/40 transition-all shadow-inner resize-none"
              placeholder="Inject core objective for carbon-aware dispatch..."
            />
            <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-3xl border border-white/5">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Carbon_Budget (g)</span>
                  <input 
                    type="range" min="1" max="20" step="0.5" 
                    value={budget} 
                    onChange={(e) => setBudget(parseFloat(e.target.value))}
                    className="w-48 accent-emerald-500"
                  />
                  <span className="text-xl font-black text-white font-mono">{budget.toFixed(1)}g</span>
               </div>
               <div className="text-[10px] font-mono text-gray-700 italic">Hardware_Context: {hwType}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 py-4">
         <button 
           onClick={handleGeneratePlan}
           disabled={loading || !!refinement}
           className="px-16 py-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-gray-700 text-white font-black text-[13px] uppercase tracking-[0.4em] rounded-[2.5rem] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center gap-6 italic"
         >
           {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-robot"></i>}
           {loading ? 'Analyzing Multi-Agent Pareto Paths...' : 'Execute_Carbon_Supervisor_Dispatch'}
         </button>
      </div>

      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-10">
          
          {/* Carbon Accounting and Reasoning */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-[#111] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden shadow-2xl group">
                {isGridDirty && (
                  <div className="absolute top-0 left-0 w-full h-full bg-red-500/[0.03] pointer-events-none"></div>
                )}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                   <i className="fa-solid fa-receipt text-7xl text-emerald-500"></i>
                </div>
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-12 border-b border-emerald-500/10 pb-4 italic">Carbon_Audit_Ledger</h4>
                
                <div className="space-y-12">
                   <div className="flex justify-between items-end px-2">
                      <div className="space-y-1">
                         <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Theoretical_Unoptimized</div>
                         <div className="text-2xl font-black text-gray-500 font-mono line-through opacity-30">{plan.marginalSavings?.legacyFootprint.toFixed(2)}g</div>
                      </div>
                      <div className="text-right space-y-1">
                         <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Optimized_Footprint</div>
                         <div className="text-5xl font-black text-white tracking-tighter font-mono">{plan.totalEstimatedCarbon.toFixed(2)}g</div>
                      </div>
                   </div>

                   <div className={`p-10 rounded-[2.5rem] text-center shadow-2xl transition-all duration-500 ${
                     isGridDirty ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
                   }`}>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 font-mono text-white/40">Total_Grams_Avoided</div>
                      <div className="text-6xl font-black text-white tracking-tighter mb-4">-{plan.marginalSavings?.savingsGrams.toFixed(2)}g</div>
                      <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isGridDirty ? 'text-red-400' : 'text-emerald-500'}`}>
                         {plan.marginalSavings?.percentage}% Mitigation Relative to Baseline
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 shadow-xl">
                <h5 className="text-[11px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3 italic">
                  <i className="fa-solid fa-microchip"></i>
                  Strategic_Reasoning
                </h5>
                <p className="text-[14px] text-gray-400 font-serif italic leading-relaxed border-l-2 border-blue-500/20 pl-8">
                  "{plan.reasoning}"
                </p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-3">
                   <span className="text-[10px] font-black text-white uppercase bg-blue-500/20 px-4 py-1.5 rounded-xl border border-blue-500/10 shadow-lg">Mode: {plan.adaptationStrategy}</span>
                   {isGridDirty && (
                     <span className="text-[10px] font-black text-white uppercase bg-red-500/20 px-4 py-1.5 rounded-xl border border-red-500/10 shadow-lg">Eco-Mode Throttling</span>
                   )}
                </div>
             </div>
          </div>

          {/* Sub-Task Execution Map */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-8 mb-4">
                <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] italic">Pipeline_Execution_Map</h4>
                <div className="flex gap-8">
                   <div className="flex items-center gap-3 text-[10px] text-gray-700 uppercase font-black tracking-widest">
                      <span className={`w-2.5 h-2.5 rounded-full ${isGridDirty ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      {isGridDirty ? 'THROTTLED_DISPATCH' : 'FULL_FIDELITY'}
                   </div>
                </div>
             </div>
             
             {plan.subtasks.map((st) => {
               const agent = MOCK_AGENTS.find(a => a.id === st.assignedAgentId);
               return (
                 <div key={st.id} className="group p-10 bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between hover:border-emerald-500/30 transition-all shadow-2xl relative overflow-hidden gap-6">
                    <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${isGridDirty ? 'bg-red-500/40 group-hover:bg-red-500' : 'bg-emerald-500/20 group-hover:bg-emerald-500'}`}></div>
                    
                    <div className="flex items-center gap-10 relative z-10">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-mono text-lg font-black transition-all shadow-inner border border-white/5 ${
                        isGridDirty ? 'bg-red-500/5 text-red-400 group-hover:bg-red-500/10' : 'bg-white/5 text-gray-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'
                      }`}>
                         {st.id}
                      </div>
                      <div>
                         <div className="flex flex-wrap items-center gap-4 mb-2">
                            <div className="text-[16px] font-black text-white uppercase tracking-tight italic">{st.label}</div>
                            {st.adaptationMode && (
                              <span className={`px-4 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-tighter italic border ${
                                isGridDirty ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              }`}>
                                {st.adaptationMode}
                              </span>
                            )}
                         </div>
                         <div className="text-[12px] text-gray-600 font-mono italic">
                           Pruning: {isGridDirty ? 'Level 4 (Aggressive)' : 'Level 1 (Light)'} // Energy_Est: {st.estimatedEnergy.toFixed(2)}μJ
                         </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 relative z-10 self-end md:self-center">
                       <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Expected_Carbon</div>
                       <div className={`text-4xl font-black font-mono tracking-tighter ${isGridDirty ? 'text-red-400' : 'text-emerald-500'}`}>
                         {st.estimatedCarbon.toFixed(3)}g
                       </div>
                       <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{agent?.name}</div>
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
