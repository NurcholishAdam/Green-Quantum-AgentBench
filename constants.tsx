
import { AgentBenchmark, HardwareProfile } from './types';

export const HARDWARE_PROFILES: Record<string, HardwareProfile> = {
  H100_Cluster: {
    type: 'H100_Cluster',
    energyBaseline: 0.1, // 100nJ baseline for servers
    carbonFootprintPerWH: 0.45
  },
  Jetson_Orin: {
    type: 'Jetson_Orin',
    energyBaseline: 0.02, // 20nJ baseline for edge
    carbonFootprintPerWH: 0.38
  },
  Edge_TPU: {
    type: 'Edge_TPU',
    energyBaseline: 0.005, // 5nJ baseline for ultra-low power
    carbonFootprintPerWH: 0.32
  }
};

export const MOCK_AGENTS: AgentBenchmark[] = [
  {
    id: 'ga-ultra',
    name: 'Green-Agent-Ultra',
    version: '3.1.0',
    greenScore: 96,
    sScore: 94,
    quantumErrorCorrection: 92,
    provenanceClarity: 98,
    multilingualReach: 95,
    latency: 85,
    energyPerToken: 0.08,
    carbonIntensity: 0.03,
    memoryEfficiency: 94
  },
  {
    id: 'ga-core',
    name: 'Green-Agent-Standard',
    version: '2.5.0',
    greenScore: 82,
    sScore: 78,
    quantumErrorCorrection: 45,
    provenanceClarity: 70,
    multilingualReach: 80,
    latency: 140,
    energyPerToken: 0.25,
    carbonIntensity: 0.12,
    memoryEfficiency: 82
  },
  {
    id: 'ql-mod',
    name: 'QL-Graph-Optimized',
    version: '1.0.0',
    greenScore: 72,
    sScore: 68,
    quantumErrorCorrection: 95,
    provenanceClarity: 91,
    multilingualReach: 70,
    latency: 110,
    energyPerToken: 0.38,
    carbonIntensity: 0.20,
    memoryEfficiency: 68
  }
];

export const QUANTUM_COLORS = {
  quantum: '#8b5cf6', 
  agent: '#10b981',   
  error: '#ef4444',   
  provenance: '#3b82f6',
  policy: '#f59e0b',
  hardware: '#64748b'
};
