
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { QuantumGraphData, GraphNode, GraphLink } from '../types';
import { QUANTUM_COLORS } from '../constants';
import { getGraphTelemetry } from '../services/geminiService';

interface Props {
  data: QuantumGraphData;
  type?: string;
  autoRefresh?: boolean;
}

const QuantumGraph: React.FC<Props> = ({ data: initialData, type = 'provenance', autoRefresh = true }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<QuantumGraphData>(initialData);
  const [isSyncing, setIsSyncing] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['quantum', 'agent', 'error', 'provenance', 'policy', 'hardware']));
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  const toggleType = (type: string) => {
    setVisibleTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const fetchUpdate = useCallback(async () => {
    setIsSyncing(true);
    try {
      const newData = await getGraphTelemetry(type);
      if (newData && newData.nodes.length > 0) {
        setGraphData(newData);
      }
    } catch (err) {
      console.error("Entanglement sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [type]);

  // Sync with incoming initialData prop (important when App.tsx updates it)
  useEffect(() => {
    setGraphData(initialData);
  }, [initialData]);

  // Initial load and auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchUpdate, 20000); // 20s interval for stability tracking
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchUpdate]);

  // Local jitter for "Dynamic Entanglement" feel
  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setGraphData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => ({
          ...n,
          val: Math.max(10, Math.min(100, n.val + (Math.random() - 0.5) * 2))
        }))
      }));
    }, 3000);
    return () => clearInterval(jitterInterval);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight || 450;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    const filteredNodes = graphData.nodes.filter(n => visibleTypes.has(n.type));
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    if (!simulationRef.current) {
      svg.selectAll("*").remove();
      // Add defs for glows
      const defs = svg.append("defs");
      Object.entries(QUANTUM_COLORS).forEach(([key, color]) => {
        const filter = defs.append("filter").attr("id", `glow-${key}`);
        filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      });

      svg.append("g").attr("class", "links");
      svg.append("g").attr("class", "nodes");

      simulationRef.current = d3.forceSimulation()
        .force("link", d3.forceLink().id((d: any) => d.id).distance(140))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60));
    }

    const sim = simulationRef.current;
    
    // Smoothly transition existing nodes or add new ones
    const currentNodes = sim.nodes();
    const nodes = filteredNodes.map(d => {
      const existing = currentNodes.find(n => n.id === d.id);
      if (existing) {
        return Object.assign(existing, d);
      }
      return { ...d, x: width / 2, y: height / 2 };
    });

    const links = filteredLinks.map(d => ({
      ...d,
      source: nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : (d.source as any).id)),
      target: nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : (d.target as any).id))
    }));

    sim.nodes(nodes);
    (sim.force("link") as d3.ForceLink<any, any>).links(links);

    const linkElements = svg.select(".links")
      .selectAll("line")
      .data(links, (d: any) => `${typeof d.source === 'string' ? d.source : d.source.id}-${typeof d.target === 'string' ? d.target : d.target.id}`)
      .join(
        enter => enter.append("line")
          .attr("stroke-width", 0)
          .attr("stroke-opacity", 0)
          .transition().duration(800)
          .attr("stroke-opacity", (d: any) => Math.min(0.7, 0.15 + (d.weight / 40)))
          .attr("stroke-width", (d: any) => 1.5 + (d.weight / 8))
          .selection(),
        update => update
          .transition().duration(800)
          .attr("stroke-width", (d: any) => 1.5 + (d.weight / 8))
          .attr("stroke-opacity", (d: any) => Math.min(0.7, 0.15 + (d.weight / 40)))
          .selection(),
        exit => exit.transition().duration(500).attr("stroke-width", 0).remove()
      )
      .attr("stroke", (d: any) => d.weight > 20 ? "#10b981" : d.weight > 10 ? "#3b82f6" : "#444")
      .attr("stroke-dasharray", (d: any) => d.weight < 8 ? "6,4" : "none");

    const nodeElements = svg.select(".nodes")
      .selectAll("circle")
      .data(nodes, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("r", 0)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .attr("opacity", 0)
          .call(d3.drag<any, any>()
            .on("start", (event, d) => {
              if (!event.active) sim.alphaTarget(0.3).restart();
              d.fx = d.x; d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = event.x; d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) sim.alphaTarget(0);
              d.fx = null; d.fy = null;
            }) as any
          )
          .transition().duration(1000)
          .attr("r", (d: any) => 14 + (d.val / 7))
          .attr("opacity", 1)
          .selection(),
        update => update
          .transition().duration(1000)
          .attr("r", (d: any) => 14 + (d.val / 7))
          .selection(),
        exit => exit.transition().duration(500).attr("r", 0).remove()
      )
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="space-y-2 min-w-[240px]">
            <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
              <span class="text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 font-mono">${d.type}_node</span>
              <span class="text-[8px] font-mono text-white/30 italic">ID:${d.id}</span>
            </div>
            <div class="text-[16px] font-black text-white tracking-tight leading-tight">${d.label}</div>
            <div class="pt-2 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[9px] text-gray-600 uppercase font-black">Node_Fidelity</span>
                <span class="text-[13px] font-mono font-bold" style="color: ${QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS]}">${d.val.toFixed(2)}%</span>
              </div>
              <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div class="h-full transition-all duration-1000" style="width: ${d.val}%; background-color: ${QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS]}"></div>
              </div>
            </div>
          </div>
        `);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .attr("fill", (d: any) => QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS])
      .attr("filter", (d: any) => d.val > 75 ? `url(#glow-${d.type})` : "none");

    sim.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeElements
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    sim.alpha(0.15).restart();
  }, [graphData, visibleTypes]);

  return (
    <div className="relative w-full bg-[#0d0d0d] border border-white/5 rounded-[3rem] overflow-hidden h-[550px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col group">
      <div ref={tooltipRef} className="pointer-events-none fixed z-[9999] opacity-0 bg-black/90 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl transition-opacity duration-300" />
      
      <div className="absolute top-10 left-12 z-10 space-y-2">
        <div className="flex items-center gap-4">
           <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'} shadow-lg shadow-emerald-500/20`}></div>
           <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] font-mono">Dynamic_Lineage_Orchestrator</h3>
        </div>
        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest pl-7">
          {isSyncing ? 'Recalculating Decision Lineage...' : 'Tracking Real-time Path Stability Flux'}
        </p>
      </div>

      <div className="absolute top-10 right-12 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
        {(Object.keys(QUANTUM_COLORS) as Array<keyof typeof QUANTUM_COLORS>).map(type => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
              visibleTypes.has(type) ? 'bg-white/5 border-white/10 text-white' : 'border-transparent text-gray-800'
            }`}
            style={{ color: visibleTypes.has(type) ? QUANTUM_COLORS[type] : '' }}
          >
            {type}
          </button>
        ))}
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button 
          onClick={fetchUpdate}
          disabled={isSyncing}
          className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-all active:scale-90"
          title="Force Entanglement Sync"
        >
          <i className={`fa-solid fa-sync ${isSyncing ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      <div className="absolute bottom-10 left-12 z-10 space-y-3">
        <div className="flex items-center gap-4 group/legend">
           <div className="w-12 h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-500/10 rounded-full"></div>
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] group-hover/legend:text-emerald-500/80 transition-colors">Stable_Decision_Lineage</span>
        </div>
        <div className="flex items-center gap-4 group/legend">
           <div className="w-12 h-[3px] bg-gradient-to-r from-blue-500 to-blue-500/10 rounded-full"></div>
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] group-hover/legend:text-blue-500/80 transition-colors">Quantum_Entanglement_Flux</span>
        </div>
        <div className="flex items-center gap-4 group/legend">
           <div className="w-12 h-[1px] border-t border-dashed border-gray-600"></div>
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] group-hover/legend:text-gray-400 transition-colors">Stochastic_Inference_Drift</span>
        </div>
      </div>

      <div className="absolute bottom-10 right-12 z-10 pointer-events-none opacity-40">
         <div className="text-[10px] font-mono text-gray-700 text-right">
            ACTIVE_NODES: {graphData.nodes.length}<br/>
            PATH_ENTROPY: {(1 - (graphData.links.reduce((acc, l) => acc + l.weight, 0) / (graphData.links.length * 30 || 1))).toFixed(3)}<br/>
            FIDELITY_FLOOR: {(graphData.nodes.reduce((acc, n) => acc + n.val, 0) / graphData.nodes.length || 0).toFixed(1)}%
         </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default QuantumGraph;
