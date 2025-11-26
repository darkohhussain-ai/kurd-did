import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const enrichMovieMetadata = async (title: string): Promise<any> => {
  const client = getAI();
  if (!client) throw new Error("API Key missing");

  const prompt = `Provide metadata for the movie or TV show titled "${title}". Return JSON.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            year: { type: Type.STRING },
            genre: { type: Type.ARRAY, items: { type: Type.STRING } },
            rating: { type: Type.STRING, description: "IMDb style rating e.g. 8.5" },
            posterSearchQuery: { type: Type.STRING, description: "Search query to find a poster" }
          },
          required: ["description", "year", "genre", "rating"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini enrichment failed", error);
    return null;
  }
};

export const cleanChannelList = async (rawInput: string): Promise<any[]> => {
  const client = getAI();
  if (!client) throw new Error("API Key missing");

  // Only processing a snippet if too long to save tokens/time
  const snippet = rawInput.substring(0, 5000); 

  const prompt = `
    Analyze this raw IPTV playlist snippet and extract valid channels.
    Clean the channel names (remove junk chars like | US | FHD).
    Categorize them.
    Return a JSON array.
    Snippet:
    ${snippet}
  `;

  try {
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        group: { type: Type.STRING },
                        url: { type: Type.STRING, description: "The stream URL found" }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Gemini cleanup failed", e);
    return [];
  }
};