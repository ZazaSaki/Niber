import { GoogleGenAI } from "@google/genai";

/**
 * Transcribes handwritten notes from an image into Markdown.
 */
export const transcribeImage = async (
  base64Data: string, 
  mimeType: string,
  options?: { apiKey?: string; model?: string }
): Promise<string> => {
  // Prioritize custom key, fallback to env var
  const apiKey = options?.apiKey?.trim() || process.env.API_KEY || '';
  const model = options?.model || 'gemini-3-flash-preview';

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your settings or environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `
              You are an expert transcriber and technical documenter. 
              Please transcribe the handwritten notes in this image directly into clean, well-formatted Markdown.
              
              Rules:
              1. Preserve the structure (headings, bullet points, numbered lists).
              2. **DIAGRAMS**: If you see any diagrams (flowcharts, sequence diagrams, mind maps, graphs, etc.), you MUST convert them into a valid Mermaid.js code block (\`\`\`mermaid ... \`\`\`). Do your best to interpret the logic and connections.
              3. Ignore irrelevant doodles or scribbles unless they are diagrams.
              4. Do not add any conversational filler (e.g., "Here is the transcription"). Just output the Markdown.
              5. If a word is illegible, mark it as [?].
              6. Use bold or italics if the original text emphasizes it.
            `,
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text was generated from the image.");
    }
    return text;

  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error(error.message || "Failed to transcribe image.");
  }
};