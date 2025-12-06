import { NextRequest, NextResponse } from "next/server";
import { analyzeTicketWithGemini, mockAnalyzeTicket } from "@/lib/services/ticket-analysis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    // Basic validation
    if (!image || !image.data || !image.mimeType) {
      return NextResponse.json({ error: "Please provide a valid image" }, { status: 400 });
    }

    // Check if using mock mode
    const useMock = process.env.USE_MOCK_AI === "true";

    if (useMock) {
      console.log("Using mock ticket analysis");
      const result = await mockAnalyzeTicket();
      return NextResponse.json(result);
    }

    // Real AI analysis
    const result = await analyzeTicketWithGemini(image);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Ticket analysis error:", error);
    return NextResponse.json(
      { error: "Ticket analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
