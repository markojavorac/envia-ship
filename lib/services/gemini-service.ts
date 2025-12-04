import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt, parseGeminiResponse } from "@/lib/gemini-parser";
import type { PackageAnalysis } from "@/lib/types/ai-analysis";

export async function analyzePackageWithGemini(
  images: { data: string; mimeType: string }[]
): Promise<PackageAnalysis> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  // Using Gemini 2.5 Flash - GA model optimized for vision analysis
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = buildGeminiPrompt();

  const imageParts = images.map((img) => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType,
    },
  }));

  const result = await model.generateContent([{ text: prompt }, ...imageParts]);

  const response = result.response;
  const analysisText = response.text();

  console.log("Gemini response:", analysisText);

  return parseGeminiResponse(analysisText);
}
