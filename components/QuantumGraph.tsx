
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { QuantumGraphData, GraphNode, GraphLink } from '../types';
import { QUANTUM_COLORS } from '../constants';

interface Props {
  data: QuantumGraphData;
}

const QuantumGraph: React.FC<Props> = ({ data: externalData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<QuantumGraphData>(externalData);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['quantum', 'agent', 'error', 'provenance']));
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

  // Sync with external data updates
  useEffect(() => {
    if (externalData && externalData.nodes.length > 0) {
      setGraphData(externalData);
    }
  }, [externalData]);

  // Jitter and simulation of drift
  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(prev => ({
        nodes: prev.nodes.map((n) => {
          const jitter = (Math.random() - 0.5) * 5;
          const drift = Math.random() > 0.95 ? (Math.random() - 0.5) * 20 : 0;
          return {
            ...n,
            val: Math.max(5, Math.min(100, n.val + jitter + drift))
          };
        }),
        links: prev.links.map(l => ({
          ...l,
          weight: Math.max(1, Math.min(30, l.weight + (Math.random() - 0.5) * 2))
        }))
      }));
    }, 1500);

    return () => clearInterval(interval);
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
      svg.append("g").attr("class", "links");
      svg.append("g").attr("class", "nodes");

      simulationRef.current = d3.forceSimulation()
        .force("link", d3.forceLink().id((d: any) => d.id).distance(140))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(40));
    }

    const sim = simulationRef.current;
    const nodes = filteredNodes.map(d => {
      const existing = sim.nodes().find(n => n.id === d.id);
      return existing ? { ...existing, ...d } : { ...d };
    });

    const links = filteredLinks.map(d => ({
      ...d,
      source: nodes.find(n => n.id === (typeof d.source === 'string' ? d.source : (d.source as any).id)),
      target: nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : (d.target as any).id))
    }));

    sim.nodes(nodes);
    (sim.force("link") as d3.ForceLink<any, any>).links(links);

    svg.select(".links")
      .selectAll("line")
      .data(links, (d: any) => `${d.source.id}-${d.target.id}`)
      .join("line")
      .attr("stroke", (d: any) => d.weight > 20 ? "#10b981" : "#333") // Green highlight for stable paths
      .attr("stroke-opacity", (d: any) => Math.min(1, 0.2 + (d.weight / 30)))
      .attr("stroke-width", (d: any) => 1 + (d.weight / 5))
      .attr("stroke-dasharray", (d: any) => d.weight < 5 ? "4 4" : "none"); // Dash for unstable/low-weight links

    svg.select(".nodes")
      .selectAll("circle")
      .data(nodes, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("r", 0)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
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
          ),
        update => update,
        exit => exit.remove()
      )
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="space-y-2 min-w-[200px]">
            <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
              <span class="text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 font-mono">${d.type}_node</span>
              <span class="text-[8px] font-mono text-white/30">#${d.id}</span>
            </div>
            <div class="text-[15px] font-black text-white tracking-tight leading-tight">${d.label}</div>
            <div class="pt-2 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[9px] text-gray-600 uppercase font-black">Fidelity_Signal</span>
                <span class="text-[12px] font-mono font-bold" style="color: ${QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS]}">${d.val.toFixed(2)}%</span>
              </div>
              <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div class="h-full transition-all duration-700" style="width: ${d.val}%; background-color: ${QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS]}"></div>
              </div>
            </div>
            <div class="pt-1 flex items-center gap-2 text-[8px] font-mono ${d.val > 80 ? 'text-emerald-500/60' : 'text-amber-500/60'}">
               <i class="fa-solid fa-check-circle"></i>
               <span>Lineage Integrity: ${d.val > 90 ? 'OPTIMAL' : d.val > 70 ? 'STABLE' : 'DRIFTING'}</span>
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
      .transition()
      .duration(300)
      .attr("r", (d: any) => 10 + (d.val / 6))
      .attr("filter", (d: any) => d.val > 85 ? `drop-shadow(0 0 12px ${QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS]}aa)` : "none");

    sim.on("tick", () => {
      svg.selectAll("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      svg.selectAll("circle")
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    sim.alpha(0.2).restart();
  }, [graphData, visibleTypes]);

  return (
    <div className="relative w-full bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden h-[450px] shadow-2xl flex flex-col">
      <div ref={tooltipRef} className="pointer-events-none fixed z-[9999] opacity-0 bg-black/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-opacity" />
      
      <div className="absolute top-8 left-10 z-10 flex flex-col gap-1">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] font-mono">Quantum_Provenance_Engine</h3>
        <div className="flex items-center gap-3">
           <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">Live_Lineage_Trace_Active</span>
        </div>
      </div>

      <div className="absolute top-8 right-10 z-10 flex gap-2">
        {(Object.keys(QUANTUM_COLORS) as Array<keyof typeof QUANTUM_COLORS>).map(type => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] border transition-all ${
              visibleTypes.has(type) ? 'bg-white/5 border-white/20 text-white' : 'border-transparent text-gray-700'
            }`}
            style={{ color: visibleTypes.has(type) ? QUANTUM_COLORS[type] : '' }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="absolute bottom-8 left-10 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[8px] font-mono text-gray-600">
           <div className="w-8 h-0.5 bg-emerald-500"></div>
           <span>STABLE_DECISION_PATH</span>
        </div>
        <div className="flex items-center gap-3 text-[8px] font-mono text-gray-600">
           <div className="w-8 h-0.5 bg-gray-700 border-t border-dashed border-gray-500"></div>
           <span>PATH_UNCERTAINTY_DRIFT</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default QuantumGraph;
