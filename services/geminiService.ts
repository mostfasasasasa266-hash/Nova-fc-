
// @google/genai Service Configuration
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutType, InBodyReport, ChatMessage, NutritionPlan, Exercise } from "../types";

const FAST_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const IMAGE_PRO_MODEL = 'gemini-3-pro-image-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const VIDEO_MODEL = 'veo-3.1-fast-generate-preview';

// Basic chat functionality with mandatory search grounding extraction
export const chatWithGemini = async (message: string, history: ChatMessage[] = [], options: any = {}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents,
    config: {
       temperature: 0.7,
       tools: options.useSearch ? [{ googleSearch: {} }] : []
    }
  });
  
  // Extract grounding chunks for mandatory UI listing as per guidelines
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  return { 
    text: response.text,
    groundingChunks 
  };
};

// Generates a comprehensive 7-day sport performance plan - Switched to PRO_MODEL for complex reasoning
export const generateSportPlan = async (user: UserProfile, sport: WorkoutType, goals: string, lang: string = 'ar') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Role: Elite Athletic Performance Director.
    Task: Create a world-class 7-day development blueprint for ${sport}.
    User Profile:
    - Gender: ${user.gender}, Age: ${user.age}
    - Biometrics: ${user.height}cm, ${user.weight}kg, Body Fat: ${user.bodyFat}%
    - Body Type: ${user.bodyType}, Activity Level: ${user.activityLevel}
    - Level: ${user.level}, Training Environment: ${user.equipment}
    - Commitment: ${user.daysPerWeek} days/week, ${user.sessionDuration} mins/session
    - Focus: ${user.focusArea}, Constraints: ${user.injuries}
    - Additional Goals: ${goals}
    
    Structure:
    Return a valid JSON object with:
    - title: String
    - weeklySchedule: Array of 7 objects [
        {
          day: String (e.g. Day 1: Strength Build),
          isRest: Boolean,
          physical: { title: String, exercises: Array of strings },
          technical: { title: String, exercises: Array of strings },
          tactical: { title: String, exercises: Array of strings },
          mental: { title: String, exercises: Array of strings },
          reaction: { title: String, exercises: Array of strings },
          nutrition: String (Meal tip for this day),
          totalDuration: String
        }
      ]
    - coachTip: String (Overall elite advice)
    
    Notes: 
    1. If environment is 'none', only bodyweight. 
    2. If 'rehab', ensure safety for ${user.injuries}. 
    3. Respond in ${lang}.
  `;

  const response = await ai.models.generateContent({
    model: PRO_MODEL, // Upgraded to PRO for better plan quality
    contents: prompt,
    config: {
      temperature: 0.8,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          weeklySchedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                isRest: { type: Type.BOOLEAN },
                physical: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                technical: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                tactical: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                mental: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                reaction: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
                nutrition: { type: Type.STRING },
                totalDuration: { type: Type.STRING }
              }
            }
          },
          coachTip: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

// Implementation of generateNutritionPlan
export const generateNutritionPlan = async (user: UserProfile, goals: string, lang: string = 'ar'): Promise<NutritionPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a precision nutrition plan for ${user.name} with goal ${goals} in ${lang}. Focus on macro-nutrient balance and meal timings.`;
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyCalories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            }
          },
          waterIntake: { type: Type.NUMBER },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                macros: {
                  type: Type.OBJECT,
                  properties: {
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER }
                  }
                },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          supplements: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// Implementation of performDigitalInBody for BioScanner component using image input
export const performDigitalInBody = async (frontImage: string, sideImage: string, user: UserProfile): Promise<InBodyReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: [{
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: frontImage } },
        { inlineData: { mimeType: 'image/jpeg', data: sideImage } },
        { text: `Perform a detailed biometric visual analysis for this athlete: ${JSON.stringify(user)}. Based on the images, provide an InBody style report estimating fat percentage, muscle mass, and posture.` }
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fatPercentage: { type: Type.NUMBER },
          muscleMass: { type: Type.STRING },
          skeletalMuscleMass: { type: Type.STRING },
          bmr: { type: Type.NUMBER },
          visceralFat: { type: Type.NUMBER },
          bmi: { type: Type.NUMBER },
          bodyType: { type: Type.STRING },
          postureAnalysis: { type: Type.STRING },
          symmetryScore: { type: Type.NUMBER },
          healthRisk: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// Implementation of generateImagePro with mandatory API key selection check
export const generateImagePro = async (prompt: string, config: { aspectRatio?: string, imageSize?: "1K" | "2K" | "4K" }) => {
  // Check for API key selection as required for Pro Image models
  if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: IMAGE_PRO_MODEL,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio || "1:1",
        imageSize: config.imageSize || "1K"
      }
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// Implementation of generateVideoVeo with mandatory API key selection and 404 handling
export const generateVideoVeo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
  // Check for API key selection as required for Veo models
  if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e: any) {
    // Reset key selection state and prompt user to select a key again if 404/Not Found
    if (e?.message?.includes("Requested entity was not found")) {
      await (window as any).aistudio?.openSelectKey();
    }
    throw e;
  }
};

// Implementation of editImageFlash for CreativeSuite image-to-image tasks
export const editImageFlash = async (base64ImageData: string, mimeType: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: {
      parts: [
        { inlineData: { data: base64ImageData, mimeType: mimeType } },
        { text: prompt }
      ]
    }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// Implementation of discoverExercise for ExerciseLibrary
export const discoverExercise = async (query: string, lang: string, filters: any): Promise<Exercise> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Research or create an exercise description for: ${query}. Use these filters: ${JSON.stringify(filters)}. Provide full technical details in ${lang}.`;
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          image: { type: Type.STRING },
          duration: { type: Type.STRING },
          ageGroups: { type: Type.ARRAY, items: { type: Type.STRING } },
          location: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          muscleGroup: { type: Type.STRING },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  const data = JSON.parse(response.text || '{}');
  return { ...data, id: `ai-${Date.now()}` };
};

// Implementation of regenerateDayPlan for PlanGenerator
export const regenerateDayPlan = async (user: UserProfile, sport: string, day: any, lang: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Regenerate this specific training day for ${sport}. Previous routine: ${JSON.stringify(day)}. Follow the user profile: ${JSON.stringify(user)}. Return in ${lang}.`;
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          isRest: { type: Type.BOOLEAN },
          physical: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          technical: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          tactical: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          mental: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          reaction: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, exercises: { type: Type.ARRAY, items: { type: Type.STRING } } } },
          nutrition: { type: Type.STRING },
          totalDuration: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// Implementation of regenerateExercise for PlanGenerator
export const regenerateExercise = async (exerciseName: string, lang: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide an advanced or varied intensity alternative for the following exercise: ${exerciseName}. Respond in ${lang}.`;
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt
  });
  return response.text;
};
