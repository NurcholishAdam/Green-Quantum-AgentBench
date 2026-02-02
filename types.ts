
export interface AgentBenchmark {
  id: string;
  name: string;
  version: string;
  greenScore: number; 
  quantumErrorCorrection: number; 
  provenanceClarity: number; 
  multilingualReach: number; 
  latency: number; 
  energyPerToken: number; 
  carbonIntensity: number; // gCO2eq
  memoryEfficiency: number; // 0-100 score
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'quantum' | 'agent' | 'error' | 'provenance' | 'policy';
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
      carbon_intensity_g: number;
      latency_ms: number;
      memory_peak_mb: number;
    };
    metadata: {
      timestamp: string;
      agent_id: string;
    };
  };
  policy_feedback?: string;
  chaos_alert?: string;
  reasoning_log: string;
}
