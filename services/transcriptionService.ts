import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "../types";

interface TranscribeOptions {
  apiKey: string;
  model: string;
  provider: AIProvider;
  baseUrl?: string;
}

const SYSTEM_PROMPT = `
You are an expert transcriber and technical documenter. 
Please transcribe the handwritten notes in this image directly into clean, well-formatted Markdown.

Rules:
1. Preserve the structure (headings, bullet points, numbered lists).
2. **DIAGRAMS**: If you see any diagrams (flowcharts, sequence diagrams, mind maps, graphs, etc.), you MUST convert them into a valid Mermaid.js code block (\`\`\`mermaid ... \`\`\`). Do your best to interpret the logic and connections.
3. Ignore irrelevant doodles or scribbles unless they are diagrams.
4. Do not add any conversational filler (e.g., "Here is the transcription"). Just output the Markdown.
5. If a word is illegible, mark it as [?].
6. Use bold or italics if the original text emphasizes it.
`;

export const transcribeImage = async (
  base64Data: string,
  mimeType: string,
  options: TranscribeOptions
): Promise<string> => {
  const { apiKey, model, provider, baseUrl } = options;

  // For custom provider, apiKey might be optional depending on the local server setup
  if (!apiKey && provider !== 'custom') {
    throw new Error(`API Key for ${provider} is missing. Please check your settings.`);
  }

  switch (provider) {
    case 'google':
      return transcribeWithGoogle(base64Data, mimeType, apiKey, model);
    case 'openai':
      return transcribeWithOpenAI(base64Data, mimeType, apiKey, model);
    case 'anthropic':
      return transcribeWithAnthropic(base64Data, mimeType, apiKey, model);
    case 'custom':
      return transcribeWithCustom(base64Data, mimeType, apiKey, model, baseUrl);
    default:
      throw new Error(`Provider ${provider} not supported.`);
  }
};

const transcribeWithGoogle = async (base64: string, mimeType: string, apiKey: string, model: string) => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: SYSTEM_PROMPT },
      ],
    },
  });
  return response.text || "No text generated.";
};

const transcribeWithOpenAI = async (base64: string, mimeType: string, apiKey: string, model: string) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this note." },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No text generated.";
};

const transcribeWithCustom = async (base64: string, mimeType: string, apiKey: string, model: string, baseUrl?: string) => {
  // Ensure we have a valid endpoint. 
  // Common convention: User provides "http://localhost:11434/v1", we append "/chat/completions"
  // or user provides "http://localhost:11434", we might need to be smart.
  // For now, let's assume standard OpenAI-compatible "/v1/chat/completions" path structure 
  // if the user provided base URL ends in /v1, otherwise we try to construct it.
  
  let endpoint = baseUrl || "http://localhost:11434/v1";
  
  // Remove trailing slash if present
  if (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1);
  }

  // Append chat completions path if not present
  if (!endpoint.endsWith('/chat/completions')) {
     endpoint = `${endpoint}/chat/completions`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe this note." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) errorMessage = errorJson.error.message;
        else if (errorJson.message) errorMessage = errorJson.message;
      } catch (e) {
        // use raw text
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No text generated.";
  } catch (error: any) {
    console.error("Custom API Error:", error);
    throw new Error(`Custom API Error: ${error.message}. Check your Base URL and CORS settings.`);
  }
};

const transcribeWithAnthropic = async (base64: string, mimeType: string, apiKey: string, model: string) => {
  // Note: Anthropic generally requires a backend proxy for browser usage due to CORS.
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true" 
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "Transcribe this note.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Anthropic API request failed");
  }

  const data = await response.json();
  return data.content[0]?.text || "No text generated.";
};