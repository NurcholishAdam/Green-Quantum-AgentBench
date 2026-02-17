
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentBenchmark, QuantumGraphData, OrchestrationPlan, GreenRefinement } from "../types";

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
 * Proactive Prompt Refiner.
 * Analyzes intent to find energy-saving shortcuts.
 */
export const refineGreenPrompt = async (prompt: string): Promise<GreenRefinement> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Green-Quantum Prompt Refiner.
      Task: "${prompt}"
      
      Suggest a version of this prompt that achieves the same outcome with 50-80% less energy.
      Format: JSON.`,
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
    return {
      originalPrompt: prompt,
      refinedPrompt: prompt,
      reasoning: "Optimizer offline.",
      estimatedSavings: "0%",
      energyImpact: "Medium"
    };
  }
};

/**
 * Carbon Supervisor with Thinking Mode and Marginal Savings Ledger.
 */
export const getSupervisorPlan = async (task: string, agents: AgentBenchmark[], hwType: string, budget: number): Promise<OrchestrationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a Carbon-Aware Orchestration for: "${task}"
      System Carbon Budget: ${budget}g CO2. Hardware: ${hwType}.
      
      Available Agents:
      ${agents.map(a => `- ${a.id}: ${a.name} (Energy: ${a.energyPerToken}uJ/T, CarbonIntensity: ${a.carbonIntensity}g)`).join('\n')}
      
      CALCULATE MARGINAL SAVINGS:
      Compare this run to a "Legacy Baseline" (Standard Gemini Pro on H100 Cluster) costing approx ${budget * 1.7}g CO2.
      
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
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { 
      reasoning: "Dispatch fault.", totalEstimatedCarbon: budget, carbonBudget: budget, adaptationStrategy: "Baseline", subtasks: [],
      marginalSavings: { legacyFootprint: budget * 1.5, savingsGrams: budget * 0.5, percentage: 33 }
    };
  }
};

/**
 * Chaos Stress Test with Well-Text Format.
 */
export const simulateChaos = async (scenarioId: string, metrics: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a technical STRESS TEST analysis for: "${scenarioId}".
      System Metrics: ${JSON.stringify(metrics)}
      
      FORMAT REQUIREMENTS:
      - Use "Well-Text" format: Clear, capitalized section headers.
      - Double-spacing between paragraphs.
      - No markdown symbols (*, #, _, etc.).
      - Technical, executive tone.`,
      config: { thinkingConfig: { thinkingBudget: 24000 } }
    });
    return response.text || "Report generation failed.";
  } catch (error) { return "STRESS TEST ERROR: SIGNAL LOST."; }
};

/**
 * Policy Audit with deep thinking.
 */
export const auditPolicy = async (policyText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Audit the following sustainability policy for architectural loopholes: "${policyText}"`,
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "Audit failed.";
  } catch (error) { return "Audit error."; }
};

/**
 * Energy Grid Data using Search Grounding.
 */
export const getEnergyGridData = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for real-time energy grid carbon intensity data in: "${query}".`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Data Source",
      uri: chunk.web?.uri || ""
    })).filter((l: any) => l.uri) || [];
    return { text: response.text || "No data.", links };
  } catch (error) { return { text: "Search offline.", links: [] }; }
};

/**
 * Generates a JSON graph for decision lineage with strict schema.
 */
export const getGraphTelemetry = async (type: string): Promise<QuantumGraphData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a JSON graph representing decision lineage for a ${type} context. Include nodes of types: 'quantum', 'agent', 'error', 'provenance', 'policy', 'hardware'.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['quantum', 'agent', 'error', 'provenance', 'policy', 'hardware'] },
                  val: { type: Type.NUMBER }
                },
                required: ["id", "label", "type", "val"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                },
                required: ["source", "target", "weight"]
              }
            }
          },
          required: ["nodes", "links"]
        }
      }
    });
    return JSON.parse(response.text || '{"nodes":[], "links":[]}');
  } catch (error) { 
    return { nodes: [], links: [] }; 
  }
};

export const getGreenTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update sustainability metrics: ${JSON.stringify(insights)}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              progress: { type: Type.NUMBER }
            },
            required: ["label", "value", "progress"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getProvenanceTelemetry = async (insights: any[]): Promise<any[]> => {
  return getGreenTelemetry(insights);
};

export const getQuantumTelemetry = async (insights: any[]): Promise<any[]> => {
  return getGreenTelemetry(insights);
};

export const getPolicyFeedback = async (agent: any, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Evaluate policy impact for ${agent.name}: "${instruction}"`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "No feedback.";
  } catch (error) { return "Error."; }
};

export const getChaosNotice = async (agent: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Brief warning for ${agent.name}.`,
    });
    return response.text || "Anomaly.";
  } catch (error) { return "Error."; }
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
