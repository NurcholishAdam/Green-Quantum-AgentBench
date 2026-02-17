
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentBenchmark, QuantumGraphData, OrchestrationPlan, GreenRefinement, GridContext } from "../types";

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
 */
export const calculateUGScore = (accuracy: number, energy: number, latency: number): number => {
  const score = (Math.pow(accuracy, 2)) / (Math.log(energy + 1) * latency);
  return Math.min(100, score * 5); 
};

/**
 * Calculates the Quantum Energy-per-Bit Efficiency Metric (Eeff).
 * Eeff = (Completion Ratio / Energy Consumed in Quantum Loops)
 */
export const calculateEEff = (accuracy: number, energy: number): number => {
  const ratio = accuracy / 100;
  return ratio / (energy * 1.5); // Simplified quantum-loop multiplier
};

/**
 * Fetches real-time carbon grid intensity for a region using Google Search.
 */
export const getRegionalCarbonIntensity = async (lat?: number, lon?: number): Promise<GridContext> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const locationText = (lat && lon) ? `near coordinates ${lat}, ${lon}` : "globally";
  
  try {
    // Perform search first as googleSearch tool doesn't support responseMimeType reliably for direct JSON extraction.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the current carbon intensity (gCO2/kWh) of the electricity grid ${locationText}. 
      Provide the intensity value, the region name, and a status (Clean, Balanced, or Dirty).`,
      config: { 
        tools: [{ googleSearch: {} }]
      }
    });

    // Formatting pass to extract JSON data safely.
    const formatter = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the grid intensity data from the following text and format as JSON.
      Text: "${response.text}"
      Schema: { "intensity": number, "region": string, "status": "Clean" | "Balanced" | "Dirty" }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intensity: { type: Type.NUMBER, description: "Intensity in gCO2/kWh" },
            region: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["Clean", "Balanced", "Dirty"] }
          },
          required: ["intensity", "region", "status"]
        }
      }
    });

    return JSON.parse(formatter.text || "{}") as GridContext;
  } catch (error) {
    return {
      intensity: 450,
      region: "Global Average",
      status: "Dirty",
    };
  }
};

/**
 * Carbon Supervisor with Thinking Mode and Adaptive Throttling.
 */
export const getSupervisorPlan = async (
  task: string, 
  agents: AgentBenchmark[], 
  hwType: string, 
  budget: number,
  grid?: GridContext
): Promise<OrchestrationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const gridStatus = grid?.status || "Balanced";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Task: "${task}"
      Global Carbon Budget: ${budget}g CO2. Hardware: ${hwType}.
      LIVE GRID STATUS: ${gridStatus} (${grid?.intensity} gCO2/kWh in ${grid?.region}).
      
      Available Agents:
      ${agents.map(a => `- ${a.id}: ${a.name} (Energy: ${a.energyPerToken}uJ/T, CarbonIntensity: ${a.carbonIntensity}g)`).join('\n')}
      
      CRITICAL: If Grid is "Dirty", you MUST trigger "Eco-Mode" (aggressive pruning, reduced fidelity).
      Calculate Marginal Savings vs a Legacy Baseline (1.8x multiplier).
      
      Return JSON Orchestration Plan.`,
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
            marginalSavings: {
              type: Type.OBJECT,
              properties: {
                legacyFootprint: { type: Type.NUMBER },
                savingsGrams: { type: Type.NUMBER },
                percentage: { type: Type.NUMBER }
              }
            },
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
          required: ["totalEstimatedCarbon", "carbonBudget", "reasoning", "adaptationStrategy", "subtasks", "marginalSavings"]
        }
      }
    });
    const plan = JSON.parse(response.text || "{}") as OrchestrationPlan;
    return { ...plan, gridContext: grid };
  } catch (error) {
    return { 
      reasoning: "Throttling active due to supervisor signal loss.", 
      totalEstimatedCarbon: budget, 
      carbonBudget: budget, 
      adaptationStrategy: "Emergency Eco-Mode", 
      subtasks: [],
      marginalSavings: { legacyFootprint: budget * 1.5, savingsGrams: budget * 0.5, percentage: 33 }
    };
  }
};

/**
 * Refines prompts for sustainability using Gemini 3 Flash.
 */
export const refineGreenPrompt = async (prompt: string): Promise<GreenRefinement> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As the Green-Quantum Prompt Refiner, suggest a way to achieve "${prompt}" with 60%+ less energy.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalPrompt: { type: Type.STRING },
            refinedPrompt: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            estimatedSavings: { type: Type.STRING },
            energyImpact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
          },
          required: ["originalPrompt", "refinedPrompt", "reasoning", "estimatedSavings", "energyImpact"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { originalPrompt: prompt, refinedPrompt: prompt, reasoning: "Refiner offline.", estimatedSavings: "0%", energyImpact: "Medium" };
  }
};

/**
 * Independent verification of sustainability policies.
 */
export const auditPolicy = async (policyText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Audit this sustainability policy for systemic carbon leakage: "${policyText}"`,
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "Audit report empty.";
  } catch (error) { return "Audit failed."; }
};

/**
 * Chaos simulation analytics.
 */
export const simulateChaos = async (scenarioId: string, metrics: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Stress test report for ${scenarioId}. Metrics: ${JSON.stringify(metrics)}. Use Well-Text format.`,
      config: { thinkingConfig: { thinkingBudget: 24000 } }
    });
    return response.text || "Report failed.";
  } catch (error) { return "Chaos error."; }
};

/**
 * Generates a short chaos warning or stability notice for an agent.
 */
export const getChaosNotice = async (agent: AgentBenchmark): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short sustainability audit notice for ${agent.name} based on its energy metrics.`,
    });
    return response.text || "Stability nominal.";
  } catch (error) {
    return "Audit connection unstable.";
  }
};

/**
 * Generates quantum graph data.
 */
export const getGraphTelemetry = async (type: string): Promise<QuantumGraphData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a JSON quantum graph for ${type}. Nodes: agent, quantum, error, provenance.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"nodes":[], "links":[]}');
  } catch (error) { return { nodes: [], links: [] }; }
};

/**
 * Updates general sustainability telemetry.
 */
export const getGreenTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update sustainability dashboard: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

/**
 * Updates quantum QEC telemetry.
 */
export const getQuantumTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update quantum QEC telemetry: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

/**
 * Updates provenance telemetry.
 */
export const getProvenanceTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update provenance telemetry: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
