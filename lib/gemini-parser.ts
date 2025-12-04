import type { PackageAnalysis } from "@/lib/types/ai-analysis";

export function buildGeminiPrompt(): string {
  return `You are an expert package dimension and weight estimator for a shipping company in Guatemala.

Analyze the provided package images and return ONLY valid JSON (no markdown, no code blocks).

Required JSON format:
{
  "dimensions": {
    "length": <number in cm>,
    "width": <number in cm>,
    "height": <number in cm>,
    "confidence": <0.0 to 1.0>,
    "method": "<explanation of how you estimated>"
  },
  "weight": {
    "estimate": <number in kg>,
    "confidence": <0.0 to 1.0>,
    "reasoning": "<explanation of weight estimate>"
  },
  "characteristics": {
    "shape": "box" | "cylinder" | "irregular",
    "fragility": "low" | "medium" | "high",
    "stackable": true | false,
    "recommendations": ["<shipping recommendations>"]
  }
}

DIMENSION ESTIMATION GUIDELINES:
- Look for reference objects:
  * Credit card: 8.5cm × 5.4cm
  * US Letter paper: 28cm × 21.5cm
  * Standard door: 203cm tall
  * Coin (Quarter): 2.4cm diameter
  * Smartphone: ~15cm × 7cm
- Use perspective and image context
- Consider box/packaging dimensions
- Be conservative (round up for shipping safety)
- Set confidence based on reference visibility:
  * 0.8-1.0: Clear reference objects visible
  * 0.5-0.8: Estimated from context
  * 0.0-0.5: Very uncertain, guess based on typical sizes

WEIGHT ESTIMATION GUIDELINES:
- Empty cardboard box: 0.5-1 kg
- Books: Very dense, ~2-3 kg per 5cm thickness
- Electronics: Moderate density
- Clothing/soft goods: Light, 1-5 kg
- Look for:
  * Material type (cardboard, plastic, metal)
  * Box sagging or deformation (indicates heavy)
  * Tape reinforcement (suggests weight)
  * Visible contents through openings
- Be conservative: better to overestimate weight

FRAGILITY ASSESSMENT:
- High: Glass, ceramics, electronics, mirrors, "Fragile" stickers
- Medium: Framed items, small furniture, delicate items
- Low: Books, clothing, plastic items, sturdy goods

SHAPE CLASSIFICATION:
- Box: Standard rectangular packaging
- Cylinder: Round tubes, drums, pipes
- Irregular: Bikes, furniture, odd-shaped items

Important: Analyze ALL images together for best estimate. Respond with ONLY the JSON object.`;
}

export function parseGeminiResponse(text: string): PackageAnalysis {
  try {
    // Strip markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Basic validation
    if (!parsed.dimensions || !parsed.weight || !parsed.characteristics) {
      throw new Error("Missing required fields in AI response");
    }

    return { ...parsed, success: true };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
