
import React, { useMemo } from 'react';

interface LanguageNode {
  code: string;
  name: string;
  score: number;
  script: string;
  resource: 'high' | 'mid' | 'low';
}

const LANGUAGES: LanguageNode[] = [
  { code: 'EN', name: 'English', score: 98, script: 'Latin', resource: 'high' },
  { code: 'ZH', name: 'Chinese', score: 94, script: 'Hanzi', resource: 'high' },
  { code: 'HI', name: 'Hindi', score: 82, script: 'Devanagari', resource: 'mid' },
  { code: 'ES', name: 'Spanish', score: 96, script: 'Latin', resource: 'high' },
  { code: 'AR', name: 'Arabic', score: 88, script: 'Arabic', resource: 'mid' },
  { code: 'FR', name: 'French', score: 95, script: 'Latin', resource: 'high' },
  { code: 'DE', name: 'German', score: 94, script: 'Latin', resource: 'high' },
  { code: 'JA', name: 'Japanese', score: 92, script: 'Kanji/Kana', resource: 'high' },
  { code: 'KO', name: 'Korean', score: 91, script: 'Hangul', resource: 'high' },
  { code: 'RU', name: 'Russian', score: 89, script: 'Cyrillic', resource: 'mid' },
  { code: 'PT', name: 'Portuguese', score: 93, script: 'Latin', resource: 'high' },
  { code: 'ID', name: 'Indonesian', score: 86, script: 'Latin', resource: 'mid' },
  { code: 'TR', name: 'Turkish', score: 84, script: 'Latin', resource: 'mid' },
  { code: 'VI', name: 'Vietnamese', score: 81, script: 'Latin', resource: 'mid' },
  { code: 'TH', name: 'Thai', score: 78, script: 'Thai', resource: 'low' },
  { code: 'BN', name: 'Bengali', score: 76, script: 'Bengali', resource: 'low' },
  { code: 'SW', name: 'Swahili', score: 68, script: 'Latin', resource: 'low' },
  { code: 'AM', name: 'Amharic', score: 64, script: 'Ge\'ez', resource: 'low' },
  { code: 'YOR', name: 'Yoruba', score: 62, script: 'Latin', resource: 'low' },
  { code: 'QU', name: 'Quechua', score: 58, script: 'Latin', resource: 'low' },
];

const MultilingualMosaic: React.FC = () => {
  return (
    <div className="relative w-full bg-[#0d0d0d] border border-blue-500/10 rounded-[2.5rem] overflow-hidden p-10 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] font-mono">Global_Reasoning_Mosaic</h3>
          <p className="text-[12px] text-gray-500 font-medium italic">Cross-script semantic fidelity map (Zero-Shot Flores-200)</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
            <span className="text-[9px] text-gray-400 uppercase font-black">Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-900"></div>
            <span className="text-[9px] text-gray-400 uppercase font-black">Drift</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-10 gap-4">
        {LANGUAGES.map((lang) => (
          <div 
            key={lang.code} 
            className="group relative aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center transition-all hover:bg-blue-500/10 hover:border-blue-500/30 cursor-help"
          >
            <span className="text-[12px] font-black text-gray-500 group-hover:text-blue-400 transition-colors">{lang.code}</span>
            <div className="w-full h-1 absolute bottom-2 px-2">
               <div className="w-full h-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${lang.score > 90 ? 'bg-emerald-500' : lang.score > 75 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${lang.score}%` }}
                  ></div>
               </div>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-black border border-blue-500/30 p-4 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl backdrop-blur-xl">
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white">{lang.name}</span>
                    <span className="text-[9px] font-mono text-blue-400">{lang.score}%</span>
                  </div>
                  <div className="flex justify-between text-[8px] uppercase font-bold text-gray-600">
                    <span>Script: {lang.script}</span>
                    <span className={lang.resource === 'high' ? 'text-emerald-500' : lang.resource === 'mid' ? 'text-blue-500' : 'text-amber-500'}>
                      {lang.resource}
                    </span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600 uppercase tracking-widest">
        <div className="flex gap-6">
           <span className="flex items-center gap-2"><i className="fa-solid fa-microscope text-blue-500"></i> Token_Parity: 0.98</span>
           <span className="flex items-center gap-2"><i className="fa-solid fa-language text-blue-500"></i> ISO_NODE_SYNC: OK</span>
        </div>
        <div className="animate-pulse text-blue-500/50">MONITORING_GLOBAL_SEMANTIC_DRIFT...</div>
      </div>
    </div>
  );
};

export default MultilingualMosaic;
