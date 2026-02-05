
export type HardwareType = 'H100_Cluster' | 'Jetson_Orin' | 'Edge_TPU';

export interface HardwareProfile {
  type: HardwareType;
  energyBaseline: number; 
  carbonFootprintPerWH: number;
}

export interface AgentBenchmark {
  id: string;
  name: string;
  version: string;
  greenScore: number; 
  sScore: number; 
  uG?: number; 
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
  adaptationMode?: string; 
}

export interface OrchestrationPlan {
  totalEstimatedCarbon: number;
  carbonBudget: number;
  reasoning: string;
  adaptationStrategy: string;
  subtasks: SubTask[];
  marginalSavings?: {
    legacyFootprint: number;
    savingsGrams: number;
    percentage: number;
  };
}

export interface GreenRefinement {
  originalPrompt: string;
  refinedPrompt: string;
  reasoning: string;
  estimatedSavings: string;
  energyImpact: 'High' | 'Medium' | 'Low';
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
