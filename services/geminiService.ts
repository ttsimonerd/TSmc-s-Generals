import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SearchResponseData, AspectRatio } from "../types";

// Helper to get a client instance. 
// We create a new instance each time for critical operations 
// to ensure the latest selected API key is picked up if the user changed it.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Feature: Search Grounding
 * Model: gemini-2.5-flash
 */
export const searchWithGrounding = async (query: string): Promise<SearchResponseData> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No text response available.";
    
    // Extract grounding chunks strictly from the response structure
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[];

    return {
      text,
      groundingChunks: groundingChunks?.map(chunk => ({
        web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined
      })).filter(c => c.web !== undefined)
    };
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};

/**
 * Feature: Thinking Mode
 * Model: gemini-3-pro-preview
 */
export const generateThoughtfulResponse = async (prompt: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        // High thinking budget for complex tasks
        thinkingConfig: { thinkingBudget: 32768 }, 
        // Do not set maxOutputTokens when using thinking budget unless explicitly calculated
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Error in thinking mode:", error);
    throw error;
  }
};

/**
 * Feature: Image Editing
 * Model: gemini-2.5-flash-image
 */
export const editImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64String = part.inlineData.data;
        const mime = part.inlineData.mimeType || 'image/png';
        return `data:${mime};base64,${base64String}`;
      }
    }
    
    throw new Error("No image returned from the model.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

/**
 * Feature: Pro Image Generation
 * Model: gemini-3-pro-image-preview
 */
export const generateImageWithRatio = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64String = part.inlineData.data;
        const mime = part.inlineData.mimeType || 'image/png';
        return `data:${mime};base64,${base64String}`;
      }
    }

    throw new Error("No image returned from the model.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Feature: The Redeemer
 * Model: gemini-2.5-flash
 * Generates a trivia question using Google Search for authenticity.
 */
export interface RiddleResponse {
    question: string;
    answer: string;
}

export const getRedemptionRiddle = async (excludeQuestions: string[]): Promise<RiddleResponse> => {
    const ai = getAIClient();
    const excludeText = excludeQuestions.length > 0 ? `Do NOT use these questions: ${excludeQuestions.join(' | ')}` : "";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Find a simple and fun riddle, an easy math operation (e.g., 25 + 15 * 2), or an easy trivia question from the internet. 
                       It should be Easy to Medium difficulty. It can involve numbers, logic, or wordplay.
                       ${excludeText}
                       Return ONLY a valid JSON object with 'question' and 'answer' properties.
                       Do not use markdown code blocks.`,
            config: {
                // responseMimeType cannot be used with tools
                tools: [{ googleSearch: {} }] // Gather from internet
            }
        });

        let text = response.text;
        if (!text) throw new Error("No text received");

        // Robust JSON extraction: Find the first { and the last }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        } else {
             // Fallback cleanup if regex fails but it might still be valid json
            text = text.replace(/```json\n?|\n?```/g, "").trim();
        }

        return JSON.parse(text) as RiddleResponse;
    } catch (error) {
        console.error("Redeemer error:", error);
        throw error;
    }
};

export const checkRedemptionAnswer = async (question: string, realAnswer: string, userAnswer: string): Promise<boolean> => {
     const ai = getAIClient();
     try {
         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: `Question: ${question}
                        Correct Answer: ${realAnswer}
                        User Answer: ${userAnswer}
                        
                        Is the user's answer correct? It does not need to be exact, but conceptually correct. 
                        If the answer is a number, allow for minor formatting differences (e.g. "15" vs "fifteen").
                        Return ONLY JSON: {"isCorrect": boolean}`,
             config: {
                 responseMimeType: "application/json"
             }
         });
         const res = JSON.parse(response.text || "{}");
         return res.isCorrect === true;
     } catch (e) {
         console.error("Check answer error", e);
         return false;
     }
}