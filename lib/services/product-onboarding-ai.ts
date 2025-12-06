import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductCategory } from "@/lib/marketplace/types";
import { ProductAnalysis, DescriptionTone, PriceRange } from "@/lib/types/product-analysis";
import {
  mockAnalyzeProductPhotos,
  mockGenerateDescription,
  mockSuggestPricing,
  isMockModeEnabled,
} from "./mock-product-analysis";

/**
 * Build comprehensive product analysis prompt for Gemini
 */
function buildProductAnalysisPrompt(): string {
  return `You are an expert product analyst for an e-commerce marketplace in Guatemala.

Analyze the provided product images and return ONLY valid JSON (no markdown, no code blocks).

Required JSON format:
{
  "name": "full product name extracted from labels or inferred",
  "brand": "brand name if visible, otherwise null",
  "category": "food_beverages" | "pharmacy_medical" | "general_retail",
  "dimensions": {
    "length": <number in cm>,
    "width": <number in cm>,
    "height": <number in cm>,
    "unit": "cm",
    "confidence": <0.0 to 1.0>,
    "reasoning": "explanation of how you estimated dimensions"
  },
  "weight": {
    "value": <number>,
    "unit": "g" | "kg",
    "confidence": <0.0 to 1.0>,
    "reasoning": "explanation of weight estimate"
  },
  "features": ["feature 1", "feature 2", ...],
  "extractedText": ["all visible text from labels and packaging"],
  "packaging": "box" | "bottle" | "bag" | "can" | "jar" | "other",
  "fragility": "fragile" | "medium" | "sturdy",
  "suggestedTags": ["tag1", "tag2", ...],
  "notes": ["any important observations or warnings"]
}

PRODUCT IDENTIFICATION GUIDELINES:
- Extract exact product name from labels
- Identify brand from packaging
- Include size/weight in product name if visible (e.g., "340g", "1L")
- Category classification:
  * food_beverages: Food, drinks, snacks, coffee, etc.
  * pharmacy_medical: Medicines, vitamins, supplements, medical supplies
  * general_retail: Electronics, clothing, household items, etc.

DIMENSION ESTIMATION GUIDELINES:
- Use reference objects for scale:
  * Credit card: 8.5cm × 5.4cm
  * Smartphone: ~15cm × 7cm × 1cm
  * Standard door: 203cm tall
  * Coin: ~2.4cm diameter
- Estimate product packaging dimensions
- Be conservative (round up for shipping)
- Confidence levels:
  * 0.8-1.0: Clear reference visible
  * 0.5-0.8: Estimated from context
  * 0.0-0.5: Uncertain guess

WEIGHT ESTIMATION GUIDELINES:
- Check for weight printed on labels (most accurate!)
- If not printed, estimate from:
  * Material type and density
  * Product type (coffee bag ~340g, vitamin bottle ~120g)
  * Packaging size
- Common weights:
  * Coffee bags: 250g-500g
  * Vitamin bottles: 50g-150g
  * Electronics: vary widely
  * Food items: check nutrition labels

TEXT EXTRACTION:
- Extract ALL visible text from:
  * Product names and brands
  * Nutrition labels
  * Ingredient lists
  * Expiration dates
  * Barcodes/SKU numbers
  * Warning labels

FEATURES IDENTIFICATION:
- List 3-7 key product features
- Focus on benefits, not just descriptions
- Examples:
  * "100% Guatemalan coffee"
  * "1000mg per tablet"
  * "Bluetooth 5.0 connectivity"
  * "24-hour battery life"

FRAGILITY ASSESSMENT:
- fragile: Glass, ceramics, electronics, liquids, perishables
- medium: Most packaged foods, lightweight items
- sturdy: Canned goods, books, durable goods

TAGS SUGGESTIONS:
- Generate 3-8 relevant tags
- Include: product type, brand, key features, use case
- Keep tags lowercase, hyphenated if multi-word
- Examples: "coffee", "guatemalan", "premium", "ground"

NOTES:
- Flag special requirements (refrigeration, expiration dates)
- Mention quality of photos (clear, blurry, missing angles)
- Highlight any concerns (damaged packaging, missing labels)

IMPORTANT:
- Analyze ALL images together for best accuracy
- If weight is printed on label, use that (high confidence)
- Always provide reasoning for dimensions and weight
- Respond with ONLY the JSON object, no markdown`;
}

/**
 * Build description generation prompt for specific tone
 */
function buildDescriptionPrompt(
  productData: Partial<ProductAnalysis>,
  tone: DescriptionTone
): string {
  const toneGuidelines = {
    casual: "Friendly, conversational, approachable. Use exclamation points, relatable language.",
    professional: "Clear, informative, business-like. Focus on benefits and specifications.",
    technical:
      "Detailed, specification-focused. Include technical details, measurements, standards.",
  };

  return `Generate a compelling product description for this item:

Product: ${productData.name}
Category: ${productData.category}
Features: ${productData.features?.join(", ")}
Extracted Info: ${productData.extractedText?.join("; ")}

Tone: ${tone}
${toneGuidelines[tone]}

Requirements:
- Length: 2-3 sentences (50-80 words)
- Highlight key benefits
- Include usage suggestions
- Mention unique features
- Natural, non-salesy tone
- English language only

Return ONLY valid JSON (no markdown):
{
  "description": "full 2-3 sentence description",
  "shortDescription": "1 sentence summary (max 40 words)"
}`;
}

/**
 * Parse Gemini JSON response with error handling
 */
function parseGeminiJSON<T>(text: string): T {
  try {
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    console.error("Raw response:", text);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

/**
 * Main function: Analyze product photos using Gemini Vision
 */
export async function analyzeProductPhotos(
  images: { data: string; mimeType: string }[],
  tone: DescriptionTone = "professional"
): Promise<ProductAnalysis> {
  // Use mock service if configured
  if (isMockModeEnabled()) {
    console.log("Using mock AI service");
    return mockAnalyzeProductPhotos(images as any, tone);
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = buildProductAnalysisPrompt();

  const imageParts = images.map((img) => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType,
    },
  }));

  try {
    // Step 1: Analyze product and extract data
    const analysisResult = await model.generateContent([{ text: prompt }, ...imageParts]);
    const analysisText = analysisResult.response.text();
    console.log("Product analysis response:", analysisText);

    const productData = parseGeminiJSON<ProductAnalysis>(analysisText);

    // Step 2: Generate description with specified tone
    const descriptionPrompt = buildDescriptionPrompt(productData, tone);
    const descriptionResult = await model.generateContent(descriptionPrompt);
    const descriptionText = descriptionResult.response.text();
    console.log("Description generation response:", descriptionText);

    const descriptions = parseGeminiJSON<{
      description: string;
      shortDescription: string;
    }>(descriptionText);

    // Combine results
    return {
      ...productData,
      ...descriptions,
      descriptionTone: tone,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to analyze product photos");
  }
}

/**
 * Generate new description with different tone
 */
export async function regenerateDescription(
  productData: Partial<ProductAnalysis>,
  tone: DescriptionTone
): Promise<{ description: string; shortDescription: string }> {
  // Use mock service if configured
  if (isMockModeEnabled()) {
    return mockGenerateDescription(productData.name || "Product", productData.features || [], tone);
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = buildDescriptionPrompt(productData, tone);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Regenerated description:", text);

    return parseGeminiJSON<{ description: string; shortDescription: string }>(text);
  } catch (error) {
    console.error("Description generation error:", error);
    throw new Error("Failed to generate description");
  }
}

/**
 * Suggest pricing based on category and existing products
 */
export async function suggestPricing(
  category: ProductCategory,
  productName: string,
  existingProducts?: Array<{ name: string; category: string; price: number }>
): Promise<PriceRange> {
  // Use mock service if configured
  if (isMockModeEnabled()) {
    return mockSuggestPricing(category, productName);
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const similarProducts =
    existingProducts?.filter((p) => p.category === category)?.slice(0, 10) || [];

  const prompt = `You are a pricing analyst for a Guatemala marketplace.

Product: ${productName}
Category: ${category}
${similarProducts.length > 0 ? `Similar products:\n${similarProducts.map((p) => `- ${p.name}: Q${p.price}`).join("\n")}` : "No similar products available"}

Suggest competitive pricing in Guatemalan Quetzales (GTQ).

Return ONLY valid JSON (no markdown):
{
  "min": <minimum suggested price>,
  "max": <maximum suggested price>,
  "suggested": <recommended price>,
  "currency": "GTQ",
  "reasoning": "brief explanation of pricing strategy"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Pricing suggestion:", text);

    return parseGeminiJSON<PriceRange>(text);
  } catch (error) {
    console.error("Pricing suggestion error:", error);
    // Return default pricing if AI fails
    const defaults: Record<ProductCategory, PriceRange> = {
      [ProductCategory.FOOD_BEVERAGES]: {
        min: 30,
        max: 150,
        suggested: 80,
        currency: "GTQ",
        reasoning: "Standard food pricing range",
      },
      [ProductCategory.PHARMACY_MEDICAL]: {
        min: 50,
        max: 300,
        suggested: 120,
        currency: "GTQ",
        reasoning: "Standard medical product pricing",
      },
      [ProductCategory.GENERAL_RETAIL]: {
        min: 50,
        max: 500,
        suggested: 200,
        currency: "GTQ",
        reasoning: "Standard retail pricing",
      },
    };
    return defaults[category];
  }
}

/**
 * Convert File objects to Gemini image format
 */
export async function filesToGeminiImages(
  files: File[]
): Promise<{ data: string; mimeType: string }[]> {
  return Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return {
        data: base64,
        mimeType: file.type,
      };
    })
  );
}
