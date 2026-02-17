
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea, Label } from 'recharts';
import { AgentBenchmark } from '../types';

interface Props {
  agents: AgentBenchmark[];
  selectedAgentId: string;
}

const GreenParetoChart: React.FC<Props> = ({ agents, selectedAgentId }) => {
  const chartData = useMemo(() => {
    return agents.map(agent => ({
      energy: agent.energyPerToken, // X-Axis
      accuracy: agent.greenScore,    // Y-Axis
      name: agent.name,
      id: agent.id,
      type: agent.id === selectedAgentId ? 'current' : 'frontier'
    }));
  }, [agents, selectedAgentId]);

  return (
    <div className="w-full h-[400px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis 
            type="number" 
            dataKey="energy" 
            name="Energy" 
            unit="uJ" 
            stroke="#444" 
            fontSize={10} 
            tick={{fill: '#666', fontWeight: 'bold'}}
            domain={[0, 'auto']}
          >
            <Label value="ENERGY CONSUMED (uJ/token)" position="bottom" offset={40} fill="#555" fontSize={9} fontWeight="bold" />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="accuracy" 
            name="Accuracy" 
            unit="%" 
            stroke="#444" 
            fontSize={10} 
            tick={{fill: '#666', fontWeight: 'bold'}}
            domain={[60, 100]}
          >
            <Label value="FIDELITY / ACCURACY (%)" angle={-90} position="left" offset={-10} fill="#555" fontSize={9} fontWeight="bold" />
          </YAxis>
          <ZAxis type="number" range={[100, 600]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: '#10b981' }} 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #10b98133', borderRadius: '16px', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
          
          {/* Pareto Frontier Shading */}
          <ReferenceArea x1={0} x2={0.15} y1={90} y2={100} fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeOpacity={0.1} strokeDasharray="3 3" />
          
          <Scatter name="Agent Efficiency" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'current' ? '#10b981' : '#444'} 
                stroke={entry.type === 'current' ? '#fff' : 'transparent'}
                strokeWidth={entry.type === 'current' ? 2 : 0}
                filter={entry.type === 'current' ? 'drop-shadow(0 0 10px #10b981)' : 'none'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      <div className="absolute top-2 right-10 flex gap-6">
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Efficiency_Leader</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Bench_Fleet</span>
         </div>
      </div>
    </div>
  );
};

export default GreenParetoChart;
