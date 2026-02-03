
import { GoogleGenAI, Type, Modality } from "@google/genai";
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
 * Rewards sharp models that stay lean.
 * Formula: Ug = (Accuracy^2) / (log(Energy + 1) * Latency)
 */
export const calculateUGScore = (accuracy: number, energy: number, latency: number): number => {
  const score = (Math.pow(accuracy, 2)) / (Math.log(energy + 1) * latency);
  return Math.min(100, score * 5); 
};

/**
 * Carbon-Aware Supervisor with Carbon-Trading Protocol.
 */
export const getSupervisorPlan = async (task: string, agents: AgentBenchmark[], hwType: string, budget: number): Promise<OrchestrationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are the CARBON-TRADING SUPERVISOR for a multi-agent system.
      Objective: "${task}"
      System Carbon Budget: ${budget}g CO2.
      Hardware: ${hwType}.

      Available Agents:
      ${agents.map(a => `- ${a.id}: ${a.name} (Energy: ${a.energyPerToken}uJ/T, CarbonIntensity: ${a.carbonIntensity}g)`).join('\n')}

      RULES:
      1. Project footprint. Force heavy agents into "Adaptive Modes" if over budget.
      2. Facilitate credit trades between agents to maintain task completion.

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
      reasoning: "System encountered a trading fault.", 
      totalEstimatedCarbon: budget * 0.9, 
      carbonBudget: budget, 
      adaptationStrategy: "Emergency Quantization (4-bit)", 
      subtasks: [] 
    };
  }
};

/**
 * High-Fidelity Chaos Simulation.
 * Provides a structured 'Well-Text' report on architectural stress.
 */
export const simulateChaos = async (scenarioId: string, metrics: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a structural STRESS TEST analysis for: "${scenarioId}".
      System Context: ${JSON.stringify(metrics)}
      
      SCENARIO DETAILS:
      - Semantic Drift: Monitor latent space vector misalignment.
      - Energy Surge: Power spikes causing thermal/logical instability.
      - Adversarial Poke: Prompt injection and gradient stability test.
      
      REQUIRED FORMAT: "Well-Text Professional Report"
      1. Do not use Markdown characters like #, *, or _ in headers.
      2. Use capitalized section titles followed by clear, spaced paragraphs.
      3. Use indentation for sub-points.
      4. Focus on Green Utility (Ug) impact and architectural mitigation strategies.
      
      The report must be technical, analytical, and ready for senior executive review.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "Report generation failed.";
  } catch (error) { 
    return "STRESS TEST ERROR: CORE SIGNAL LOST. UNABLE TO GENERATE ANALYSIS."; 
  }
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
      contents: `Generate a JSON ${type} graph.`,
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
      contents: `Update metrics: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getPolicyFeedback = async (agent: AgentBenchmark, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Critique instruction: "${instruction}"`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "No feedback.";
  } catch (error) { return "Feedback error."; }
};

export const auditPolicy = async (policyText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Audit: ${policyText}`,
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "Audit failed.";
  } catch (error) { return "Audit error."; }
};

export const getChaosNotice = async (agent: AgentBenchmark): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Warning for ${agent.name}.`,
    });
    return response.text || "Anomaly detected.";
  } catch (error) { return "Monitor offline."; }
};

export const getQuantumTelemetry = async (insights: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Update quantum: ${JSON.stringify(insights)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return insights; }
};

export const getProvenanceTelemetry = async (insights: any[]): Promise<any[]> => {
  return getQuantumTelemetry(insights);
};

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeAudio(bytes: Uint8Array) { return encode(bytes); }
export function decodeAudio(base64: string) { return decode(base64); }

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
