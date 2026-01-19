
import { GoogleGenAI, Type } from "@google/genai";
import { AgentBenchmark } from "../types";

export const generateAgentBeatsProposal = async (agent: AgentBenchmark) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Generate a formal benchmarking proposal for the 'AgentBeats' framework.
    Target Agent: ${agent.name} (v${agent.version})
    
    Metrics to analyze:
    1. Sustainability: Green Score of ${agent.greenScore}/100 and Energy/Token of ${agent.energyPerToken}μJ.
    2. Quantum Resilience: Error Correction Score of ${agent.quantumErrorCorrection}/100.
    3. Provenance: Lineage clarity of ${agent.provenanceClarity}/100 using Quantum Limit Graph architecture.
    4. Multilingualism: Cross-lingual reach of ${agent.multilingualReach}/100.

    Format the response as a structured report with:
    - Executive Summary
    - Methodology (mentioning Green Agent & Quantum Limit Graph integration)
    - Key Findings
    - Alignment with AgentBeats Standards
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate proposal. Please verify your connection.";
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
