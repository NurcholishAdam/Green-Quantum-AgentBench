
import React from 'react';
import { HardwareType } from '../types';
import { HARDWARE_PROFILES } from '../constants';

interface Props {
  selected: HardwareType;
  onChange: (hw: HardwareType) => void;
}

const HardwareSelector: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="flex items-center gap-4 bg-[#080808] border border-white/10 p-2 rounded-2xl">
      {(Object.keys(HARDWARE_PROFILES) as HardwareType[]).map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            selected === type 
            ? 'bg-emerald-500 text-white shadow-lg' 
            : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <i className={`fa-solid ${type === 'H100_Cluster' ? 'fa-server' : type === 'Jetson_Orin' ? 'fa-microchip' : 'fa-bolt'} mr-3`}></i>
          {type.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};

export default HardwareSelector;
