
import { AgentBenchmark } from './types';

export const MOCK_AGENTS: AgentBenchmark[] = [
  {
    id: 'gq-1',
    name: 'Gemini-3-Pro-Quantum',
    version: '2.5.1',
    greenScore: 92,
    quantumErrorCorrection: 88,
    provenanceClarity: 95,
    multilingualReach: 98,
    latency: 120,
    energyPerToken: 0.45
  },
  {
    id: 'ga-ref',
    name: 'Green-Agent-Original',
    version: '1.0.0',
    greenScore: 85,
    quantumErrorCorrection: 12,
    provenanceClarity: 45,
    multilingualReach: 60,
    latency: 250,
    energyPerToken: 0.68
  },
  {
    id: 'ql-mod',
    name: 'QL-Graph-Optimized',
    version: '0.9-alpha',
    greenScore: 78,
    quantumErrorCorrection: 94,
    provenanceClarity: 89,
    multilingualReach: 75,
    latency: 180,
    energyPerToken: 0.52
  }
];

export const QUANTUM_COLORS = {
  quantum: '#8b5cf6', // Violet
  agent: '#10b981',   // Emerald
  error: '#ef4444',   // Red
  provenance: '#3b82f6' // Blue
};
