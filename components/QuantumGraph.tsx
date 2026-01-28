
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { QuantumGraphData, GraphNode, GraphLink } from '../types';
import { QUANTUM_COLORS } from '../constants';

interface Props {
  data: QuantumGraphData;
}

const QuantumGraph: React.FC<Props> = ({ data: initialData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<QuantumGraphData>(initialData);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['quantum', 'agent', 'error', 'provenance']));
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  // Toggle node visibility by type
  const toggleType = (type: string) => {
    setVisibleTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type); // Prevent empty graph for better UX
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Simulation loop for "dynamic entanglement" - Enhanced for visual impact
  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(prev => {
        // Randomly pick a few nodes to surge, simulating a propagation wave
        const surgeCount = Math.floor(Math.random() * 3) + 1;
        const surgeIndices = new Set(
          Array.from({ length: surgeCount }, () => Math.floor(Math.random() * prev.nodes.length))
        );

        return {
          nodes: prev.nodes.map((n, idx) => {
            const jitter = (Math.random() - 0.5) * 35; // Increased jitter range
            const surge = surgeIndices.has(idx) ? 40 : 0; // Increased surge intensity
            return {
              ...n,
              val: Math.max(5, Math.min(100, n.val + jitter + surge))
            };
          }),
          links: prev.links.map(l => ({
            ...l,
            weight: Math.max(1, Math.min(30, l.weight + (Math.random() - 0.5) * 15)) // Increased weight fluctuations
          }))
        };
      });
    }, 1200); // Faster interval for more active feel

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight || 400;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Filter data based on visible types
    const filteredNodes = graphData.nodes.filter(n => visibleTypes.has(n.type));
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    // Initialize or Update Simulation
    if (!simulationRef.current) {
      svg.selectAll("*").remove();
      svg.append("g").attr("class", "links");
      svg.append("g").attr("class", "nodes");

      simulationRef.current = d3.forceSimulation()
        .force("link", d3.forceLink().id((d: any) => d.id).distance(130))
        .force("charge", d3.forceManyBody().strength(-450))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.12))
        .force("y", d3.forceY(height / 2).strength(0.12));
    }

    const sim = simulationRef.current;

    // We must pass a new copy of data to the simulation to trigger internal updates correctly
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

    // Draw Links
    const link = svg.select(".links")
      .selectAll("line")
      .data(links, (d: any) => `${d.source.id}-${d.target.id}`)
      .join(
        enter => enter.append("line")
          .attr("stroke-opacity", 0)
          .attr("stroke", "#222")
          .attr("stroke-width", 0),
        update => update,
        exit => exit.transition().duration(400).attr("stroke-opacity", 0).remove()
      )
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="space-y-1">
            <div class="text-[9px] uppercase font-bold text-gray-500 tracking-widest font-mono">Entanglement_Vector</div>
            <div class="text-[11px] font-mono text-white">${d.source.label} <i class="fa-solid fa-link mx-1 text-emerald-500"></i> ${d.target.label}</div>
            <div class="text-[10px] text-emerald-400 font-black">Flux: ${d.weight.toFixed(2)} TH/s</div>
          </div>
        `);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .transition()
      .duration(700)
      .attr("stroke-opacity", (d: any) => Math.min(1, 0.2 + (d.weight / 30)))
      .attr("stroke-width", (d: any) => 0.5 + (d.weight / 2.5))
      .attr("stroke", (d: any) => {
        if (d.weight > 20) return QUANTUM_COLORS.quantum;
        return "#333";
      });

    // Draw Nodes
    const node = svg.select(".nodes")
      .selectAll("circle")
      .data(nodes, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("r", 0)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .call(drag(sim) as any),
        update => update,
        exit => exit.transition().duration(400).attr("r", 0).remove()
      )
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="space-y-1">
            <div class="text-[9px] uppercase font-bold text-gray-500 tracking-widest font-mono">${d.type}_node</div>
            <div class="text-[13px] font-black text-white tracking-tight">${d.label}</div>
            <div class="text-[11px] font-mono font-bold" style="color: ${QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS]}">Fidelity: ${d.val.toFixed(2)}%</div>
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
      .duration(800)
      .attr("r", (d: any) => 8 + (d.val / 7))
      .attr("stroke-opacity", (d: any) => d.val / 100)
      .attr("filter", (d: any) => {
        const color = QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS];
        return d.val > 65 ? `drop-shadow(0 0 ${15 + d.val/5}px ${color}77)` : "none";
      });

    sim.on("tick", () => {
      svg.select(".links").selectAll("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      svg.select(".nodes").selectAll("circle")
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    sim.alpha(0.3).restart();

    function drag(sim: d3.Simulation<any, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, [graphData, visibleTypes]);

  return (
    <div className="relative w-full bg-[#0d0d0d] border border-white/5 rounded-[2rem] overflow-hidden h-[450px] shadow-2xl group flex flex-col">
      {/* Tooltip element */}
      <div 
        ref={tooltipRef}
        className="pointer-events-none fixed z-[9999] opacity-0 bg-black/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-opacity duration-300 min-w-[160px]"
      />

      <div className="absolute top-6 left-8 z-10 space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono">Quantum_Provenance_Flux</h3>
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
        </div>
        <p className="text-[12px] text-gray-600 font-medium italic opacity-80">Interactive decision-state entanglement nodes</p>
      </div>
      
      <div className="absolute top-6 right-8 z-10 flex gap-4">
        {/* Type Toggle Filters */}
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
          {(Object.keys(QUANTUM_COLORS) as Array<keyof typeof QUANTUM_COLORS>).map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                visibleTypes.has(type) 
                  ? 'border-transparent text-white' 
                  : 'border-white/5 text-gray-600 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
              }`}
              style={{ 
                backgroundColor: visibleTypes.has(type) ? `${QUANTUM_COLORS[type]}33` : 'transparent',
                color: visibleTypes.has(type) ? QUANTUM_COLORS[type] : ''
              }}
            >
              <i className={`fa-solid ${
                type === 'quantum' ? 'fa-microchip' : 
                type === 'agent' ? 'fa-user-astronaut' : 
                type === 'error' ? 'fa-shield-halved' : 'fa-fingerprint'
              } mr-1.5`}></i>
              {type}
            </button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full flex-grow cursor-grab active:cursor-grabbing" />
      
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-6 px-8 py-4 bg-black/40 backdrop-blur-md rounded-[1.5rem] border border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">REALTIME_UPLINK</span>
           </div>
           <div className="w-px h-4 bg-white/10"></div>
           <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-gauge-high"></i>
              DRIFT: 0.042b/s
           </div>
        </div>
        <div className="text-[8px] text-gray-700 font-mono tracking-widest uppercase">
           AGENTBEATS_SYSTEM_GEN_X7
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]"></div>
    </div>
  );
};

export default QuantumGraph;
