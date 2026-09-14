import { GoogleGenAI } from "@google/genai";

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Set it in server/.env and restart the server."
    );
  }

  return new GoogleGenAI({ apiKey });
}

export async function runGeminiTest(): Promise<string> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Reply with a short confirmation that the connection works.",
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
