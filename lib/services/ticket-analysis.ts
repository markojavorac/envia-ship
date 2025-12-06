/**
 * Ticket Analysis Service
 *
 * Uses Gemini Vision API to analyze ENVÍA delivery tickets and extract structured data.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TicketAnalysisResult {
  success: boolean;
  ticketNumber?: string;
  originAddress?: string;
  destinationAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  error?: string;
}

/**
 * Build prompt for Gemini to analyze ENVÍA delivery ticket
 */
function buildTicketAnalysisPrompt(): string {
  return `Analyze this ENVÍA delivery ticket image/PDF and extract the following information in JSON format:

CRITICAL: This is a Guatemala delivery ticket from ENVÍA. Extract ALL text exactly as written, including Spanish characters and full addresses.

Extract these fields (use exact field names):
- ticketNumber: The barcode number at the top right (e.g., DTLNO1251452370)
- originAddress: The complete address from the "Lugar de Recepción" section (include ALL address details: street, zone, building name, level, local)
- destinationAddress: The complete address from the "DESTINATARIO - Direccion" section (include ALL address details)
- recipientName: The name from "DESTINATARIO - Nombre" section
- recipientPhone: The phone number from "DESTINATARIO - Teléfono" section
- notes: The package details from "Observaciones" section

Return ONLY valid JSON in this exact format:
{
  "ticketNumber": "string or null",
  "originAddress": "string or null",
  "destinationAddress": "string or null",
  "recipientName": "string or null",
  "recipientPhone": "string or null",
  "notes": "string or null"
}

IMPORTANT:
- Include COMPLETE addresses with all details (building names, zones, levels, locals)
- Preserve all Spanish characters and accents
- If a field is not found, use null (not empty string)
- Return ONLY the JSON, no additional text or markdown`;
}

/**
 * Parse Gemini response and extract ticket data
 */
function parseTicketResponse(responseText: string): TicketAnalysisResult {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();

    // Remove ```json and ``` if present
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(cleanedText);

    return {
      success: true,
      ticketNumber: parsed.ticketNumber || undefined,
      originAddress: parsed.originAddress || undefined,
      destinationAddress: parsed.destinationAddress || undefined,
      recipientName: parsed.recipientName || undefined,
      recipientPhone: parsed.recipientPhone || undefined,
      notes: parsed.notes || undefined,
    };
  } catch (error) {
    console.error("Failed to parse ticket response:", error);
    console.error("Response text:", responseText);
    return {
      success: false,
      error: "Failed to parse ticket data from AI response",
    };
  }
}

/**
 * Analyze ENVÍA delivery ticket using Gemini Vision API
 */
export async function analyzeTicketWithGemini(image: {
  data: string;
  mimeType: string;
}): Promise<TicketAnalysisResult> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  // Using Gemini 2.5 Flash - optimized for vision and OCR
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = buildTicketAnalysisPrompt();

  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };

  try {
    const result = await model.generateContent([{ text: prompt }, imagePart]);
    const response = result.response;
    const analysisText = response.text();

    console.log("Gemini ticket analysis response:", analysisText);

    return parseTicketResponse(analysisText);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mock ticket analysis for development/testing
 * Returns random realistic Guatemala City delivery tickets
 */
export async function mockAnalyzeTicket(): Promise<TicketAnalysisResult> {
  // Import mock data dynamically to avoid circular dependencies
  const { simulateTicketAnalysis } = await import("./mock-ticket-data");
  return simulateTicketAnalysis();
}
