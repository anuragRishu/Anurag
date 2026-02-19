
import { GoogleGenAI } from "@google/genai";

/**
 * Safely access environment variables across different runtimes/build-tools.
 */
const getSafeEnv = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env[key] || '';
      }
    } catch (e) {}
    const g = (globalThis as any);
    if (g && g[key]) return g[key];
  } catch (err) {}
  return '';
};

const apiKey = getSafeEnv('API_KEY');
// Initialize client conditionally to avoid crashing if apiKey is empty during module load
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateSectionCopy = async (sectionType: string, style: string) => {
  if (!ai || !apiKey) {
    console.warn("Gemini API key is missing. AI generation will not work.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a playful, colorful, and engaging title, subtitle, and description for a video editor portfolio's ${sectionType} section. The style should be ${style}. Return the response as a simple plain text with Title: [title], Subtitle: [subtitle], Description: [description].`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
