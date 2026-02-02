
import React, { useState } from 'react';
import { auditPolicy } from '../services/geminiService';

const DEFAULT_POLICY = `[AGENT_BEATS_V3_POLICY]
- PRIORITIZE Energy Efficiency (uJ/token) > Latency if Energy > 1.5uJ.
- TRIGGER QEC Fault Shield when decoherence > 45ms.
- ENFORCE 100% Provenance Clarity on semantic forks.
- CARBON_CAP: 0.10gCO2eq per execution cluster.`;

const PolicyAuditor: React.FC = () => {
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY);
  const [report, setReport] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAudit = async () => {
    setIsAuditing(true);
    setReport(null);
    try {
      const result = await auditPolicy(policyText);
      setReport(result);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 animate-in slide-in-from-bottom-10 duration-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-3">
            <i className="fa-solid fa-code"></i>
            Policy_Configuration_Node
          </h3>
          <span className="text-[10px] font-mono text-gray-500">Live_Edit_Active</span>
        </div>
        <textarea
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
          className="w-full h-80 bg-black/40 border border-white/5 rounded-3xl p-8 text-[11px] font-mono text-amber-400/80 focus:border-amber-500/30 outline-none transition-all resize-none shadow-2xl"
          spellCheck={false}
        />
        <button
          onClick={handleAudit}
          disabled={isAuditing}
          className="w-full py-5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          {isAuditing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-microscope"></i>}
          {isAuditing ? 'Auditing with Gemini 3 Pro...' : 'Commit & Audit Policy'}
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-shield-check text-9xl"></i>
        </div>
        
        <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
          Audit_Output_Node
        </h3>

        {report ? (
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4 animate-in fade-in">
             <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                   </div>
                   <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Thought_Trace_Analysis</span>
                </div>
                <div className="text-[11px] text-gray-400 leading-relaxed font-serif italic whitespace-pre-wrap">
                  {report}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center opacity-20 space-y-6">
             <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center animate-spin-slow">
                <i className="fa-solid fa-fingerprint text-3xl"></i>
             </div>
             <p className="text-[9px] uppercase tracking-[0.5em] text-center max-w-[200px]">Awaiting Policy Committal for Sustainability Audit...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyAuditor;
