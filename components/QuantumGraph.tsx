
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QuantumGraphData, GraphNode, GraphLink } from '../types';
import { QUANTUM_COLORS } from '../constants';

interface Props {
  data: QuantumGraphData;
}

const QuantumGraph: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#444")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.weight));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", d => 5 + (d.val / 10))
      .attr("fill", d => QUANTUM_COLORS[d.type])
      .call(drag(simulation) as any);

    node.append("title").text(d => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    function drag(sim: d3.Simulation<GraphNode, undefined>) {
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
  }, [data]);

  return (
    <div className="relative w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden h-[400px]">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Quantum Provenance Lineage</h3>
        <p className="text-xs text-gray-500 mt-1">Real-time graph of decision-state entanglement</p>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-crosshair" />
      <div className="absolute bottom-4 right-4 flex space-x-4 text-[10px] uppercase font-bold">
        {Object.entries(QUANTUM_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-gray-400">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuantumGraph;
