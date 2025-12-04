import type { PackageAnalysis } from "@/lib/types/ai-analysis";

export async function mockAnalyzePackage(): Promise<PackageAnalysis> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Randomize slightly for variety
  const baseLength = 40 + Math.random() * 20;
  const baseWidth = 30 + Math.random() * 15;
  const baseHeight = 25 + Math.random() * 15;

  return {
    success: true,
    dimensions: {
      length: Math.round(baseLength * 10) / 10,
      width: Math.round(baseWidth * 10) / 10,
      height: Math.round(baseHeight * 10) / 10,
      confidence: 0.65 + Math.random() * 0.25,
      method: "Estimated using visible door frame as reference object",
    },
    weight: {
      estimate: Math.round((baseLength * baseWidth * baseHeight) / 15000 * 10) / 10,
      confidence: 0.5 + Math.random() * 0.3,
      reasoning:
        "Based on cardboard material and apparent density. Package appears moderately packed.",
    },
    characteristics: {
      shape: Math.random() > 0.7 ? "irregular" : "box",
      fragility: Math.random() > 0.5 ? "low" : "medium",
      stackable: Math.random() > 0.3,
      recommendations: [
        "Standard cardboard box in good condition",
        "Consider Standard service for cost-effectiveness",
        "No special handling appears necessary",
      ],
    },
  };
}
