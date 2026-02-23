import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { QuantumGraphData, GraphNode, GraphLink, AgentBenchmark } from '../types';
import { QUANTUM_COLORS, MOCK_AGENTS } from '../constants';
import { getGraphTelemetry, getAgentBenchmarks } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

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
  const [viewMode, setViewMode] = useState<'graph' | 'pareto'>('graph');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(MOCK_AGENTS[0].id);
  const [detailAgent, setDetailAgent] = useState<AgentBenchmark | null>(null);
  const [agentBenchmarks, setAgentBenchmarks] = useState<any>(null);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState(false);
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

  const handleAgentClick = useCallback(async (agentId: string) => {
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    if (agent) {
      setDetailAgent(agent);
      setIsLoadingBenchmarks(true);
      try {
        const benchmarks = await getAgentBenchmarks(agent);
        setAgentBenchmarks(benchmarks);
      } catch (err) {
        console.error("Failed to fetch benchmarks", err);
      } finally {
        setIsLoadingBenchmarks(false);
      }
    }
  }, []);

  const fetchUpdate = useCallback(async () => {
    setIsSyncing(true);
    try {
      const newData = await getGraphTelemetry(type);
      if (newData && newData.nodes && newData.nodes.length > 0) {
        setGraphData(newData);
      }
    } catch (err) {
      console.error("Entanglement sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [type]);

  useEffect(() => {
    if (initialData) {
      setGraphData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchUpdate, 20000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchUpdate]);

  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setGraphData(prev => ({
        ...prev,
        nodes: (prev.nodes || []).map(n => ({
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

    if (viewMode === 'pareto') {
      svg.selectAll("*").remove();
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }

      const margin = { top: 80, right: 80, bottom: 100, left: 100 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Data preparation
      const agents = MOCK_AGENTS;
      const sortedAgents = [...agents].sort((a, b) => {
        if (a.energyPerToken !== b.energyPerToken) return a.energyPerToken - b.energyPerToken;
        return b.sScore - a.sScore;
      });

      const frontier: AgentBenchmark[] = [];
      let maxAccuracy = -1;
      for (const agent of sortedAgents) {
        if (agent.sScore > maxAccuracy) {
          frontier.push(agent);
          maxAccuracy = agent.sScore;
        }
      }

      const frontierSet = new Set(frontier.map(a => a.id));

      // Scales
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(agents, d => d.energyPerToken)! * 1.2])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([innerHeight, 0]);

      // Grid lines
      g.append("g")
        .attr("class", "grid opacity-5")
        .call(d3.axisBottom(xScale).ticks(5).tickSize(innerHeight).tickFormat(() => ""));

      g.append("g")
        .attr("class", "grid opacity-5")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerWidth).tickFormat(() => ""));

      // Axes
      const xAxis = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d} J/t`));
      
      xAxis.selectAll("text").attr("class", "font-mono text-[10px] fill-gray-500");
      xAxis.select(".domain").attr("stroke", "rgba(255,255,255,0.1)");

      const yAxis = g.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`));
      
      yAxis.selectAll("text").attr("class", "font-mono text-[10px] fill-gray-500");
      yAxis.select(".domain").attr("stroke", "rgba(255,255,255,0.1)");

      // Labels
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 60)
        .attr("fill", "#666")
        .attr("text-anchor", "middle")
        .attr("class", "text-[10px] font-black uppercase tracking-[0.3em] font-mono")
        .text("Energy_Intensity (J/Token)");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -60)
        .attr("fill", "#666")
        .attr("text-anchor", "middle")
        .attr("class", "text-[10px] font-black uppercase tracking-[0.3em] font-mono")
        .text("Model_Accuracy (S-Score)");

      // Frontier Line
      const lineGenerator = d3.line<AgentBenchmark>()
        .x(d => xScale(d.energyPerToken))
        .y(d => yScale(d.sScore))
        .curve(d3.curveStepAfter);

      g.append("path")
        .datum(frontier)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8,4")
        .attr("opacity", 0.4)
        .attr("d", lineGenerator);

      // Points
      const points = g.selectAll(".dot")
        .data(agents)
        .enter().append("g")
        .attr("class", "dot-group")
        .attr("transform", d => `translate(${xScale(d.energyPerToken)},${yScale(d.sScore)})`);

      points.append("circle")
        .attr("r", d => d.id === selectedAgentId ? 12 : 8)
        .attr("fill", d => frontierSet.has(d.id) ? "#10b981" : "#3b82f6")
        .attr("fill-opacity", d => d.id === selectedAgentId ? 1 : 0.6)
        .attr("stroke", d => d.id === selectedAgentId ? "#fff" : "none")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`
            <div class="space-y-3 min-w-[220px]">
              <div class="flex items-center justify-between border-b border-white/10 pb-2">
                <span class="text-[9px] uppercase font-black tracking-widest ${frontierSet.has(d.id) ? 'text-emerald-500' : 'text-blue-500'} font-mono">
                  ${frontierSet.has(d.id) ? 'Frontier_Optimal' : 'Sub_Optimal'}
                </span>
                <span class="text-[8px] font-mono text-white/30 italic">v${d.version}</span>
              </div>
              <div class="text-lg font-black text-white tracking-tight">${d.name}</div>
              <div class="grid grid-cols-2 gap-4 pt-1">
                <div class="space-y-1">
                  <div class="text-[8px] text-gray-500 uppercase font-black">Energy</div>
                  <div class="text-sm font-mono font-bold text-white">${d.energyPerToken} <span class="text-[9px] text-gray-600">J/t</span></div>
                </div>
                <div class="space-y-1">
                  <div class="text-[8px] text-gray-500 uppercase font-black">Accuracy</div>
                  <div class="text-sm font-mono font-bold text-white">${d.sScore}%</div>
                </div>
              </div>
              <div class="pt-2">
                <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full ${frontierSet.has(d.id) ? 'bg-emerald-500' : 'bg-blue-500'}" style="width: ${d.sScore}%"></div>
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
        .on("click", (event, d) => {
          setSelectedAgentId(d.id);
          handleAgentClick(d.id);
        });

      if (selectedAgentId) {
        points.filter(d => d.id === selectedAgentId)
          .append("circle")
          .attr("r", 20)
          .attr("fill", "none")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2,2")
          .attr("class", "animate-spin-slow");
      }

      return;
    }

    const safeNodes = graphData.nodes || [];
    const safeLinks = graphData.links || [];

    const filteredNodes = safeNodes.filter(n => visibleTypes.has(n.type));
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = safeLinks.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    if (!simulationRef.current) {
      svg.selectAll("*").remove();
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
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div class="space-y-2 min-w-[200px]">
            <div class="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
              <span class="text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 font-mono">edge_link</span>
              <span class="text-[8px] font-mono text-white/30 italic">WEIGHT: ${d.weight.toFixed(1)}</span>
            </div>
            <div class="flex items-center gap-3 py-1">
              <span class="text-[11px] font-bold text-white">${d.source.label}</span>
              <i class="fa-solid fa-arrow-right-long text-[9px] text-emerald-500"></i>
              <span class="text-[11px] font-bold text-white">${d.target.label}</span>
            </div>
            <div class="pt-2">
               <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div class="h-full bg-emerald-500" style="width: ${Math.min(100, d.weight * 2)}%"></div>
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
      .attr("stroke", (d: any) => d.weight > 20 ? "#10b981" : d.weight > 10 ? "#3b82f6" : "#444")
      .attr("stroke-dasharray", (d: any) => d.weight < 8 ? "6,4" : "none")
      .attr("cursor", "help");

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
      .on("click", (event, d: any) => {
        if (d.type === 'agent') {
          handleAgentClick(d.id);
        }
      })
      .attr("fill", (d: any) => QUANTUM_COLORS[d.type as keyof typeof QUANTUM_COLORS])
      .attr("filter", (d: any) => d.val > 75 ? `url(#glow-${d.type})` : "none")
      .attr("cursor", "pointer");

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
  }, [graphData, visibleTypes, viewMode, selectedAgentId]);

  const fullNodes = graphData?.nodes || [];
  const activeNodes = fullNodes.filter(n => visibleTypes.has(n.type));
  const activeLinks = (graphData?.links || []).filter(l => {
     const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
     const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
     return visibleTypes.has(fullNodes.find(n => n.id === s)?.type || '') && visibleTypes.has(fullNodes.find(n => n.id === t)?.type || '');
  });

  return (
    <div className="relative w-full bg-[#0d0d0d] border border-white/5 rounded-[3rem] overflow-hidden h-[550px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col group">
      <div ref={tooltipRef} className="pointer-events-none fixed z-[9999] opacity-0 bg-black/95 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl transition-opacity duration-300" />
      
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
        <div className="flex bg-white/5 rounded-xl p-1 mr-2">
          <button 
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'graph' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Graph
          </button>
          <button 
            onClick={() => setViewMode('pareto')}
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'pareto' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Pareto
          </button>
        </div>
        <button 
          onClick={fetchUpdate}
          disabled={isSyncing}
          className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-all active:scale-90"
          title="Force Entanglement Sync"
        >
          <i className={`fa-solid fa-sync ${isSyncing ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      {/* INTERACTIVE LEGEND SECTION */}
      <div className="absolute bottom-10 left-12 z-10 space-y-4 p-6 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/5 max-w-[280px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
          <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Entanglement_Legend</div>
          <button 
            onClick={() => setVisibleTypes(new Set(Object.keys(QUANTUM_COLORS)))}
            className="text-[7px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors"
          >
            Reset_Filters
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {(Object.entries(QUANTUM_COLORS)).map(([type, color]) => {
            const isActive = visibleTypes.has(type);
            const count = fullNodes.filter(n => n.type === type).length;
            return (
              <button 
                key={type} 
                onClick={() => toggleType(type)}
                className={`flex items-center gap-3 group/leg transition-all text-left ${isActive ? 'opacity-100' : 'opacity-25 hover:opacity-50'}`}
              >
                 <div 
                   className="w-2.5 h-2.5 rounded-full shadow-lg transition-transform group-hover/leg:scale-125" 
                   style={{ 
                     backgroundColor: color, 
                     boxShadow: isActive ? `0 0 10px ${color}66` : 'none' 
                   }}
                 />
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover/leg:text-white transition-colors">{type}</span>
                    <span className="text-[7px] font-mono text-gray-600">{count} Nodes</span>
                 </div>
              </button>
            );
          })}
        </div>
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-4 group/legend">
             <div className="w-10 h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-500/10 rounded-full"></div>
             <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Stable_Path</span>
          </div>
          <div className="flex items-center gap-4 group/legend">
             <div className="w-10 h-[2px] bg-gradient-to-r from-blue-500 to-blue-500/10 rounded-full"></div>
             <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Quantum_Flux</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-12 z-10 pointer-events-none opacity-40">
         <div className="text-[10px] font-mono text-gray-700 text-right">
            VISIBLE_NODES: {activeNodes.length}<br/>
            PATH_ENTROPY: {(1 - (activeLinks.reduce((acc, l) => acc + (l.weight || 0), 0) / (activeLinks.length * 30 || 1))).toFixed(3)}<br/>
            FIDELITY_FLOOR: {(activeNodes.reduce((acc, n) => acc + (n.val || 0), 0) / (activeNodes.length || 1)).toFixed(1)}%
         </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* AGENT DETAIL OVERLAY */}
      <AnimatePresence>
        {detailAgent && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-0 right-0 w-full md:w-[450px] h-full bg-black/90 backdrop-blur-2xl border-l border-white/10 z-[100] overflow-y-auto shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] font-mono">Agent_Profile_v{agentBenchmarks?.version || detailAgent.version}</div>
                  <h2 className="text-3xl font-black text-white tracking-tighter leading-tight">{detailAgent.name}</h2>
                </div>
                <button 
                  onClick={() => { setDetailAgent(null); setAgentBenchmarks(null); }}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-2">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sustainability_Score</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{detailAgent.greenScore}%</div>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-2">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Accuracy_S-Score</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">{detailAgent.sScore.toFixed(1)}%</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-[11px] font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">Core_Telemetry</div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Energy_Per_Token', value: `${detailAgent.energyPerToken} J/t`, progress: detailAgent.energyPerToken * 100, color: 'bg-amber-500' },
                    { label: 'Carbon_Intensity', value: `${detailAgent.carbonIntensity} g`, progress: detailAgent.carbonIntensity * 500, color: 'bg-red-500' },
                    { label: 'Memory_Efficiency', value: `${detailAgent.memoryEfficiency}%`, progress: detailAgent.memoryEfficiency, color: 'bg-blue-500' },
                    { label: 'Quantum_Error_Correction', value: `${detailAgent.quantumErrorCorrection}%`, progress: detailAgent.quantumErrorCorrection, color: 'bg-violet-500' },
                  ].map((metric, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</span>
                        <span className="text-[11px] font-mono font-bold text-white">{metric.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, metric.progress)}%` }}
                          className={`h-full ${metric.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="text-[11px] font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">Performance_Benchmarks</div>
                {isLoadingBenchmarks ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Querying_Agent_Nexus...</span>
                  </div>
                ) : agentBenchmarks ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="text-xs text-gray-400 leading-relaxed italic">
                      "{agentBenchmarks.performanceSummary}"
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(agentBenchmarks.benchmarks).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{key.replace('_', ' ')}</span>
                          <span className="text-sm font-mono font-bold text-white">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button 
                      onClick={() => handleAgentClick(detailAgent.id)}
                      className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                    >
                      Retry_Benchmark_Sync
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-8">
                <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                  Deploy_To_Orchestrator
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuantumGraph;