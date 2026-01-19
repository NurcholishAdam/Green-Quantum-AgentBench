
export interface AgentBenchmark {
  id: string;
  name: string;
  version: string;
  greenScore: number; // 0-100 based on energy/token
  quantumErrorCorrection: number; // Error resilience score
  provenanceClarity: number; // Graph lineage transparency
  multilingualReach: number; // Benchmarking across 50+ languages
  latency: number; // ms
  energyPerToken: number; // microjoules/token
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'quantum' | 'agent' | 'error' | 'provenance';
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface QuantumGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface A2ARequest {
  task_id: string;
  instruction: string;
  constraints: string[];
}

export interface A2AResponse {
  status: 'success' | 'failure';
  payload: {
    result: string;
    metrics: {
      energy_consumed_uj: number;
      quantum_fidelity: number;
      token_count: number;
    };
    metadata: {
      timestamp: string;
      agent_id: string;
    };
  };
  reasoning_log: string;
  rlhf_critique?: string;
}

export enum BenchmarkModule {
  GREEN_METRICS = 'GREEN_METRICS',
  QUANTUM_ERR_CORRECTION = 'QUANTUM_ERR_CORRECTION',
  QUANTUM_PROVENANCE = 'QUANTUM_PROVENANCE',
  MULTILINGUAL_BENCH = 'MULTILINGUAL_BENCH'
}
