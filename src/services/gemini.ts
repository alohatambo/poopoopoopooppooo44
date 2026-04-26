import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CountrySides {
  driving: string;
  walking: string;
  escalator: string;
  funFact: string;
}

const CACHE_KEY = 'whichside_cache';

function getCache(): Record<string, CountrySides> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
}

function setCache(country: string, data: CountrySides) {
  try {
    const cache = getCache();
    cache[country] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Ignore
  }
}

export async function fetchSidesForCountry(countryName: string): Promise<CountrySides> {
  const cache = getCache();
  if (cache[countryName]) {
    return cache[countryName];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tell me which side of the road people drive on, which side of the footpath/sidewalk they walk on, and which side of an escalator they stand on in ${countryName}.`,
    config: {
      systemInstruction: "You are a helpful travel guide expert. Provide accurate or generally accepted cultural norms for the country. Be concise.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          driving: {
            type: Type.STRING,
            description: "Typically 'Left' or 'Right'."
          },
          walking: {
            type: Type.STRING,
            description: "Typically 'Left', 'Right', 'Varies', or 'No strict rule'."
          },
          escalator: {
            type: Type.STRING,
            description: "Typically 'Stand Right, Walk Left', 'Stand Left, Walk Right', or 'Varies'. Mention major cities if they differ (e.g., Tokyo vs Osaka)."
          },
          funFact: {
             type: Type.STRING,
             description: "A short 1 sentence fun fact about this country's traffic or walking habits."
          }
        },
        required: ["driving", "walking", "escalator", "funFact"]
      }
    }
  });

  try {
    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr.trim()) as CountrySides;
    setCache(countryName, data);
    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not fetch data for this country.");
  }
}
