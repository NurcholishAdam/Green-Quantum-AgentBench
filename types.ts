
export type HardwareType = 'H100_Cluster' | 'Jetson_Orin' | 'Edge_TPU';

export interface HardwareProfile {
  type: HardwareType;
  energyBaseline: number; // The 'B' in the S-Score formula
  carbonFootprintPerWH: number;
}

export interface AgentBenchmark {
  id: string;
  name: string;
  version: string;
  greenScore: number; 
  sScore: number; // Strong Sustainability Score
  quantumErrorCorrection: number; 
  provenanceClarity: number; 
  multilingualReach: number; 
  latency: number; 
  energyPerToken: number; 
  carbonIntensity: number; 
  memoryEfficiency: number;
  hwProfile?: HardwareType;
}

export interface SubTask {
  id: string;
  label: string;
  assignedAgentId: string;
  estimatedEnergy: number;
  estimatedCarbon: number;
  scope3Penalty: number;
}

export interface OrchestrationPlan {
  totalEstimatedCarbon: string;
  reasoning: string;
  subtasks: SubTask[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'quantum' | 'agent' | 'error' | 'provenance' | 'policy' | 'hardware';
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
      scope3_penalty: number;
    };
    metadata: {
      timestamp: string;
      agent_id: string;
      s_score: number;
    };
  };
  reasoning_log: string;
}
