
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentBenchmark, QuantumGraphData, OrchestrationPlan, GreenRefinement } from "../types";

export interface SearchResult {
  text: string;
  links: { title: string; uri: string }[];
}

export const calculateSScore = (accuracy: number, energy: number, baseline: number): number => {
  return accuracy * Math.exp(-(energy / baseline));
};

export const calculateUGScore = (accuracy: number, energy: number, latency: number): number => {
  const score = (Math.pow(accuracy, 2)) / (Math.log(energy + 1) * latency);
  return Math.min(100, score * 5); 
};

/**
 * Intercepts a prompt and suggests a greener, more efficient version.
 * Uses Gemini 3 Flash for near-instant response.
 */
export const refineGreenPrompt = async (prompt: string): Promise<GreenRefinement> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Green-Quantum Prompt Refiner.
      Analyze the user's prompt for energy waste: "${prompt}"
      
      Suggest a refined version that achieves the goal with significantly less computation.
      Example: Summarize instead of full generation, check metadata before deep scans.
      
      Return JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalPrompt: { type: Type.STRING },
            refinedPrompt: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            estimatedSavings: { type: Type.STRING, description: "e.g. 70% energy reduction" },
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
      reasoning: "Refiner offline. Maintaining original intent.",
      estimatedSavings: "0%",
      energyImpact: "Medium"
    };
  }
};

/**
 * Enhanced Supervisor that calculates Marginal Savings vs Standard Baseline.
 */
export const getSupervisorPlan = async (task: string, agents: AgentBenchmark[], hwType: string, budget: number): Promise<OrchestrationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are the CARBON-TRADING SUPERVISOR. 
      Task: "${task}"
      Global Carbon Budget: ${budget}g CO2
      Hardware: ${hwType}
      
      Available Agents:
      ${agents.map(a => `- ${a.id}: ${a.name} (Energy: ${a.energyPerToken}uJ/T, CarbonIntensity: ${a.carbonIntensity}g)`).join('\n')}
      
      CALCULATE MARGINAL SAVINGS:
      Assume a "Legacy Baseline" (Standard Gemini Pro on H100) would cost exactly ${budget * 1.5}g for this specific task.
      Estimate our current optimized path cost and savings.
      
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
      reasoning: "Trading fault.", 
      totalEstimatedCarbon: budget, 
      carbonBudget: budget, 
      adaptationStrategy: "Fallback", 
      subtasks: [],
      marginalSavings: { legacyFootprint: budget * 1.5, savingsGrams: budget * 0.5, percentage: 33 }
    };
  }
};

export const simulateChaos = async (scenarioId: string, metrics: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform well-text professional STRESS TEST analysis for: "${scenarioId}".
      System Metrics: ${JSON.stringify(metrics)}
      
      Format with clear capitalized headers, spaced paragraphs, and no markdown symbols.`,
      config: { thinkingConfig: { thinkingBudget: 24000 } }
    });
    return response.text || "Analysis inconclusive.";
  } catch (error) { return "STRESS TEST ERROR."; }
};

export const getLiveEnvironmentData = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Get environmental grid data: ${query}`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Resource",
      uri: chunk.web?.uri || ""
    })).filter((l: any) => l.uri) || [];
    return { text: response.text || "No data.", links };
  } catch (error) { return { text: "Search failed.", links: [] }; }
};

export const getGraphTelemetry = async (type: string): Promise<QuantumGraphData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a JSON ${type} graph visualizing agent credit trades.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"nodes":[], "links":[]}');
  } catch (error) { return { nodes: [], links: [] }; }
};

export const getPolicyFeedback = async (agent: any, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Critique instruction impact on Ug Utility: "${instruction}"`,
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
      contents: `Short warning: Carbon budget drift on ${agent.name}.`,
    });
    return response.text || "Notice.";
  } catch (error) { return "Error."; }
};

export const getQuantumTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update metrics: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

/**
 * Audits a sustainability policy text using Gemini 3 Pro.
 */
export const auditPolicy = async (policyText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Conduct a sustainability audit for the following policy text: "${policyText}"`,
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "No audit feedback provided.";
  } catch (error) {
    return "Failed to audit policy.";
  }
};

/**
 * Fetches simulated updates for sustainability metrics (Green tab).
 */
export const getGreenTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update the following sustainability metrics for a dashboard: ${JSON.stringify(insights)}`,
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
  } catch (error) {
    return insights;
  }
};

/**
 * Fetches simulated updates for decision lineage provenance (Provenance tab).
 */
export const getProvenanceTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update the following provenance lineage metrics: ${JSON.stringify(insights)}`,
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
  } catch (error) {
    return insights;
  }
};

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
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
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
