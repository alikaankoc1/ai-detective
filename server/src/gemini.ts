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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reply with a short confirmation that the connection works.",
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    if (
      raw.toLowerCase().includes("quota") ||
      raw.includes("429") ||
      raw.toLowerCase().includes("resource_exhausted")
    ) {
      throw new Error(
        "Gemini günlük ücretsiz kotası doldu. Birkaç dakika sonra tekrar dene."
      );
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}
