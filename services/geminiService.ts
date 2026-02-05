
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
      Example: "Instead of a 2000-word analysis, start with a 500-word executive summary with key metrics."
      
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
 * Uses Gemini 3 Pro with Thinking for complex carbon-trading orchestration.
 */
export const getSupervisorPlan = async (task: string, agents: AgentBenchmark[], hwType: string, budget: number): Promise<OrchestrationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are the CARBON-TRADING SUPERVISOR for a multi-agent AI system.
      Task: "${task}"
      Global Carbon Budget: ${budget}g CO2
      Hardware Profile: ${hwType}
      
      Available Agents:
      ${agents.map(a => `- ${a.id}: ${a.name} (Energy: ${a.energyPerToken}uJ/T, CarbonIntensity: ${a.carbonIntensity}g)`).join('\n')}
      
      CRITICAL INSTRUCTION: Calculate Marginal Carbon Savings. 
      Assume a "Legacy Baseline" (Standard Gemini Pro on H100 Cluster) would cost significantly more for this task.
      Estimate our optimized path cost and the grams of CO2 avoided.
      
      Return a JSON orchestration plan with subtasks assigned to agents.`,
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
      reasoning: "Trading protocol encounter a fault. Defaulting to safe baseline.", 
      totalEstimatedCarbon: budget * 0.8, 
      carbonBudget: budget, 
      adaptationStrategy: "Emergency Quantization", 
      subtasks: [],
      marginalSavings: { legacyFootprint: budget * 1.6, savingsGrams: budget * 0.8, percentage: 50 }
    };
  }
};

/**
 * Conducts a high-fidelity stress test analysis with Well-Text formatting.
 */
export const simulateChaos = async (scenarioId: string, metrics: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a structural STRESS TEST analysis for the scenario: "${scenarioId}".
      Real-time System Metrics: ${JSON.stringify(metrics)}
      
      REQUIREMENTS:
      1. Use a "Well-Text" Professional Report format. 
      2. Clear capitalized headers, spaced paragraphs. 
      3. No Markdown symbols like #, *, or _.
      4. Detailed analysis of Green Utility (Ug) degradation.`,
      config: { thinkingConfig: { thinkingBudget: 24000 } }
    });
    return response.text || "Analysis report generation failed.";
  } catch (error) { return "STRESS TEST ERROR: CRITICAL SIGNAL LOSS."; }
};

/**
 * Fetches real-time environmental context using Google Search grounding.
 */
export const getLiveEnvironmentData = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for live environmental and grid data related to: "${query}". Provide a summary and sources.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Environmental Source",
      uri: chunk.web?.uri || ""
    })).filter((l: any) => l.uri) || [];
    return { text: response.text || "No live data found.", links };
  } catch (error) { return { text: "Search protocol failed.", links: [] }; }
};

/**
 * Standard Telemetry fetch using Gemini 3 Flash.
 */
export const getGraphTelemetry = async (type: string): Promise<QuantumGraphData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a JSON quantum-graph structure for ${type} decision paths.`,
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
      contents: `Evaluate the Green Utility impact of this instruction: "${instruction}" for the agent ${agent.name}.`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "Feedback currently unavailable.";
  } catch (error) { return "Feedback error."; }
};

export const getChaosNotice = async (agent: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short technical warning about carbon budget drift on ${agent.name}.`,
    });
    return response.text || "Budget anomaly detected.";
  } catch (error) { return "Notice error."; }
};

export const auditPolicy = async (policyText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Conduct a deep sustainability audit for this policy: "${policyText}". Check for loopholes in carbon reporting.`,
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "Audit report empty.";
  } catch (error) { return "Audit failed."; }
};

export const getGreenTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update these sustainability metrics: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getProvenanceTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update these provenance metrics: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getQuantumTelemetry = async (insights: any[]): Promise<any[]> => {
  return getGreenTelemetry(insights);
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
