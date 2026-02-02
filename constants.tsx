
import { AgentBenchmark } from './types';

export const MOCK_AGENTS: AgentBenchmark[] = [
  {
    id: 'ga-ultra',
    name: 'Green-Agent-Ultra',
    version: '3.0.0',
    greenScore: 96,
    quantumErrorCorrection: 92,
    provenanceClarity: 98,
    multilingualReach: 95,
    latency: 85,
    energyPerToken: 0.12,
    carbonIntensity: 0.04,
    memoryEfficiency: 94
  },
  {
    id: 'ga-core',
    name: 'Green-Agent-Standard',
    version: '2.1.0',
    greenScore: 88,
    quantumErrorCorrection: 45,
    provenanceClarity: 70,
    multilingualReach: 80,
    latency: 140,
    energyPerToken: 0.35,
    carbonIntensity: 0.15,
    memoryEfficiency: 82
  },
  {
    id: 'ql-mod',
    name: 'QL-Graph-Optimized',
    version: '0.9-beta',
    greenScore: 72,
    quantumErrorCorrection: 95,
    provenanceClarity: 91,
    multilingualReach: 70,
    latency: 110,
    energyPerToken: 0.42,
    carbonIntensity: 0.22,
    memoryEfficiency: 68
  }
];

export const QUANTUM_COLORS = {
  quantum: '#8b5cf6', 
  agent: '#10b981',   
  error: '#ef4444',   
  provenance: '#3b82f6',
  policy: '#f59e0b' // Amber for Policy
};
