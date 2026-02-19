
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSectionCopy = async (sectionType: string, style: string) => {
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
