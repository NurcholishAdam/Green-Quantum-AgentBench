
import { GoogleGenAI, Type } from "@google/genai";
import { AgentBenchmark, A2ARequest, A2AResponse, QuantumGraphData, OrchestrationPlan } from "../types";

// Define SearchResult for grounding tasks
export interface SearchResult {
  text: string;
  links: { title: string; uri: string }[];
}

/**
 * Calculates the Strong Sustainability Score (S-Score).
 */
export const calculateSScore = (accuracy: number, energy: number, baseline: number): number => {
  return accuracy * Math.exp(-(energy / baseline));
};

/**
 * Calculates the Green Utility Metric (Ug).
 * Formula: Ug = (Accuracy^2) / (log(Energy + 1) * Latency)
 */
export const calculateUGScore = (accuracy: number, energy: number, latency: number): number => {
  const score = (Math.pow(accuracy, 2)) / (Math.log(energy + 1) * latency);
  // Normalize for display purposes (arbitrary scale)
  return Math.min(100, score / 10); 
};

/**
 * Carbon-Aware Supervisor with Carbon-Trading Protocol.
 */
export const getSupervisorPlan = async (task: string, agents: AgentBenchmark[], hwType: string, budget: number): Promise<OrchestrationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are the CARBON-TRADING SUPERVISOR. 
      Task: "${task}"
      Global Carbon Budget: ${budget}g CO2
      Hardware Context: ${hwType}
      
      Available Agents:
      ${agents.map(a => `- ${a.id}: ${a.name} (Energy: ${a.energyPerToken}uJ/T, CarbonIntensity: ${a.carbonIntensity}g)`).join('\n')}
      
      TRADING PROTOCOL:
      1. If total estimated carbon exceeds ${budget}g, you MUST force agents into "Adaptive Modes" (Quantized, Pruned, or Distilled).
      2. Agents trade credits. If the Search Agent is heavy, the Synthesis Agent must switch to a smaller model.
      3. Account for Scope 3 network penalties (0.05g per external call).
      
      Return a JSON orchestration plan.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalEstimatedCarbon: { type: Type.NUMBER },
            carbonBudget: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            adaptationStrategy: { type: Type.STRING },
            subtasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  assignedAgentId: { type: Type.STRING },
                  estimatedEnergy: { type: Type.NUMBER },
                  estimatedCarbon: { type: Type.NUMBER },
                  scope3Penalty: { type: Type.NUMBER },
                  adaptationMode: { type: Type.STRING }
                }
              }
            }
          },
          required: ["totalEstimatedCarbon", "carbonBudget", "reasoning", "adaptationStrategy", "subtasks"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Supervisor offline", error);
    return { 
      reasoning: "Failed to generate plan.", 
      totalEstimatedCarbon: 0, 
      carbonBudget: budget, 
      adaptationStrategy: "N/A", 
      subtasks: [] 
    };
  }
};

export const auditPolicy = async (policyText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `AUDIT Policy: ${policyText}. Focus on Ug (Green Utility) enforcement.`,
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "Audit failed.";
  } catch (error) { return "Audit error."; }
};

export const simulateChaos = async (chaosType: string, metrics: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Simulate "${chaosType}" on metrics: ${JSON.stringify(metrics)}. How does it degrade the Ug Utility Score?`,
    });
    return response.text || "Chaos simulation failed.";
  } catch (error) { return "Sim failed."; }
};

export const getGraphTelemetry = async (type: string): Promise<QuantumGraphData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a JSON object for a ${type} graph. Show recursive lineage of carbon-trades.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"nodes":[], "links":[]}');
  } catch (error) { return { nodes: [], links: [] }; }
};

export const getGreenTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update these insights with a focus on Ug (Green Utility) and adaptive compression gains: ${JSON.stringify(insights)}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              subtext: { type: Type.STRING },
              icon: { type: Type.STRING },
              progress: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getPolicyFeedback = async (agent: AgentBenchmark, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Instruction: "${instruction}". Critique its impact on Ug Utility: (Acc^2)/(log(E+1)*Lat).`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "No feedback.";
  } catch (error) { return "Feedback error."; }
};

export const getPolicyReporter = async (agent: AgentBenchmark): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find real news on "Adaptive AI model quantization" and carbon trading protocols.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Green Resource",
      uri: chunk.web?.uri || ""
    })).filter((l: any) => l.uri) || [];
    return { text: response.text || "", links };
  } catch (error) { return { text: "Search failed.", links: [] }; }
};

export const getChaosNotice = async (agent: AgentBenchmark): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Short warning: Carbon budget drift on ${agent.name}.`,
    });
    return response.text || "Anomaly detected.";
  } catch (error) { return "Monitor offline."; }
};

export const getQuantumTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Shift these quantum metrics based on adaptive model pressure: ${JSON.stringify(insights)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              subtext: { type: Type.STRING },
              icon: { type: Type.STRING },
              progress: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getProvenanceTelemetry = async (insights: any[]): Promise<any[]> => {
  return getQuantumTelemetry(insights);
};

export const processA2ATask = async (request: A2ARequest, agent: AgentBenchmark): Promise<A2AResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Handshake: ${request.instruction}. Agent ${agent.name}. Account for Ug Utility metric in the response.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 20000 }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { 
      status: 'failure', 
      payload: { 
        result: "Bridge Error", 
        metrics: { energy_consumed_uj: 0, quantum_fidelity: 0, token_count: 0, carbon_intensity_g: 0, latency_ms: 0, memory_peak_mb: 0, scope3_penalty: 0 }, 
        metadata: { timestamp: new Date().toISOString(), agent_id: agent.id, s_score: 0 } 
      }, 
      reasoning_log: "System fault." 
    };
  }
};
