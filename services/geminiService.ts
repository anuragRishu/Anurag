
import { GoogleGenAI } from "@google/genai";

/**
 * Generates section copy using Gemini AI.
 * Follows the latest @google/genai guidelines for initialization and content generation.
 */
export const generateSectionCopy = async (sectionType: string, style: string) => {
  // Always create a new instance right before making an API call to ensure it uses up-to-date key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a playful, colorful, and engaging title, subtitle, and description for a video editor portfolio's ${sectionType} section. The style should be ${style}. Return the response as a simple plain text with Title: [title], Subtitle: [subtitle], Description: [description].`,
    });
    
    // Use the .text property to access the generated text as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
