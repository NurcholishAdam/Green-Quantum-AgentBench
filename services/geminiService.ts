
import { GoogleGenAI, Type } from "@google/genai";
import { AgentBenchmark } from "../types";

export const generateAgentBeatsProposal = async (agent: AgentBenchmark) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Generate an extremely detailed, high-reasoning formal benchmarking proposal for the 'AgentBeats' framework.
    Target Agent: ${agent.name} (v${agent.version})
    
    Metrics to analyze:
    1. Sustainability: Green Score of ${agent.greenScore}/100 and Energy/Token of ${agent.energyPerToken}μJ.
    2. Quantum Resilience: Error Correction Score of ${agent.quantumErrorCorrection}/100.
    3. Provenance: Lineage clarity of ${agent.provenanceClarity}/100 using Quantum Limit Graph architecture.
    4. Multilingualism: Cross-lingual reach of ${agent.multilingualReach}/100.

    Analyze these metrics against the highest standards of energy-efficient AI and quantum-resilient computing.
    Format the response as a structured report with:
    - Executive Summary
    - Deep Methodology (Green Agent & Quantum Limit Graph integration)
    - Theoretical Framework for Sustainability
    - Alignment with AgentBeats Standards
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Thinking Mode):", error);
    return "Failed to generate proposal using deep reasoning. Please verify your connection.";
  }
};

export interface SearchResult {
  text: string;
  sources: { uri: string; title?: string }[];
}

export const searchGreenStandards = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the latest global standardizations and principles for 'Green AI' and sustainable agent architectures as of ${new Date().toLocaleDateString()}. Focus on: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const sources: { uri: string; title?: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });

    return {
      text: response.text || "No information found.",
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};

export const analyzeQuantumProvenance = async (logs: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these agent execution logs for quantum provenance and potential error loops: \n\n${logs}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctionPath: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ["anomalies", "correctionPath", "confidenceScore"]
      }
    }
  });
  
  return JSON.parse(response.text);
};
