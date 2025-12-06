import { NextRequest, NextResponse } from "next/server";
import { analyzePackageWithGemini } from "@/lib/services/gemini-service";
import { mockAnalyzePackage } from "@/lib/mock-ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images } = body;

    // Basic validation
    if (!images || images.length === 0 || images.length > 5) {
      return NextResponse.json({ error: "Please provide 1-5 images" }, { status: 400 });
    }

    // Check if using mock mode
    const useMock = process.env.USE_MOCK_AI === "true";

    if (useMock) {
      console.log("Using mock AI service");
      const result = await mockAnalyzePackage();
      return NextResponse.json(result);
    }

    // Real AI analysis
    const result = await analyzePackageWithGemini(images);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
