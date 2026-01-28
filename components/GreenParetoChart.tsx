
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea, Label } from 'recharts';

interface Insight {
  label: string;
  value: string;
  subtext: string;
  icon: string;
  progress: number;
}

interface Props {
  insights: Insight[];
}

const GreenParetoChart: React.FC<Props> = ({ insights }) => {
  const chartData = useMemo(() => {
    // Extract current metrics from insights
    const carbonInsight = insights.find(i => i.label.toLowerCase().includes('carbon'));
    const accuracyInsight = insights.find(i => i.label.toLowerCase().includes('balance') || i.label.toLowerCase().includes('accuracy'));
    
    // Parse numeric values (e.g., "0.08g/hr" -> 0.08)
    const currentCarbon = carbonInsight ? parseFloat(carbonInsight.value) : 0.08;
    const currentAccuracy = accuracyInsight ? parseFloat(accuracyInsight.value) * 100 : 94;

    const baseFrontier = [
      { accuracy: 88, carbon: 0.05, name: 'Eco_Model_V2', type: 'frontier' },
      { accuracy: 92, carbon: 0.08, name: 'AgentBeats_Core', type: 'frontier' },
      { accuracy: 75, carbon: 0.02, name: 'Nano_Green', type: 'frontier' },
    ];

    return [
      ...baseFrontier,
      { 
        accuracy: currentAccuracy > 1 ? currentAccuracy : currentAccuracy * 100, 
        carbon: currentCarbon, 
        name: 'LIVE_AGENT_NODE', 
        type: 'current' 
      },
      { accuracy: 98, carbon: 0.45, name: 'Legacy_Heavy_Compute', type: 'outlier' },
    ];
  }, [insights]);

  return (
    <div className="relative w-full bg-[#0d0d0d] border border-emerald-500/10 rounded-[2.5rem] overflow-hidden h-[480px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 flex flex-col group">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] font-mono">Sustainability_Frontier_v25</h3>
          <p className="text-[12px] text-gray-500 font-medium italic">Mapping multi-objective Pareto optimality: Fidelity vs. Emissions</p>
        </div>
        <div className="flex gap-6 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Target_Zone</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_#8b5cf6]"></div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Live_Agent</span>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#1a1a1a" vertical={false} />
            <XAxis 
              type="number" 
              dataKey="carbon" 
              name="Carbon" 
              unit="g" 
              stroke="#333" 
              fontSize={10} 
              tick={{fill: '#444', fontWeight: 'bold'}}
              domain={[0, 0.5]}
            >
              <Label value="CARBON INTENSITY (gCO2eq/hr)" position="bottom" offset={20} fill="#666" fontSize={9} fontWeight="bold" />
            </XAxis>
            <YAxis 
              type="number" 
              dataKey="accuracy" 
              name="Accuracy" 
              unit="%" 
              stroke="#333" 
              fontSize={10} 
              tick={{fill: '#444', fontWeight: 'bold'}}
              domain={[60, 100]}
            >
              <Label value="TASK FIDELITY (%)" angle={-90} position="left" offset={-10} fill="#666" fontSize={9} fontWeight="bold" />
            </YAxis>
            <ZAxis type="number" range={[150, 800]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: '#10b981' }} 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #10b98133', borderRadius: '16px', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <ReferenceArea x1={0} x2={0.12} y1={90} y2={100} fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeOpacity={0.1} strokeDasharray="3 3" />
            <Scatter name="Efficiency Nodes" data={chartData}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === 'current' ? '#8b5cf6' : entry.type === 'frontier' ? '#10b981' : '#ef4444'} 
                  stroke={entry.type === 'current' ? '#fff' : 'transparent'}
                  strokeWidth={entry.type === 'current' ? 2 : 0}
                  className={entry.type === 'current' ? 'animate-pulse' : ''}
                  filter={entry.type === 'current' ? 'drop-shadow(0 0 15px #8b5cf6)' : 'none'}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Baseline_EMF</span>
            <span className="text-[11px] font-mono text-gray-400">242.4 g/kWh</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Optimizer_Node</span>
            <span className="text-[11px] font-mono text-emerald-500/70 uppercase">AgentBeats_GA_X7</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 flex items-center gap-3">
          <i className="fa-solid fa-circle-nodes animate-spin-slow"></i>
          FRONTIER_OPTIMAL_STABLE
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent_40%)]"></div>
    </div>
  );
};

export default GreenParetoChart;
