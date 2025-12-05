import { NextRequest, NextResponse } from "next/server";
import { analyzeProductPhotos, filesToGeminiImages } from "@/lib/services/product-onboarding-ai";
import { DescriptionTone } from "@/lib/types/product-analysis";

/**
 * POST /api/admin/analyze-product
 *
 * Analyze product photos using Gemini Vision AI
 * Accepts multipart/form-data with 1-5 images
 *
 * Request body:
 * - images: File[] (1-5 images, max 10MB each)
 * - tone?: 'casual' | 'professional' | 'technical' (optional, default: professional)
 *
 * Response:
 * - success: boolean
 * - data?: ProductAnalysis
 * - error?: string
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract images
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image") && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Validate image count
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please upload at least one image" },
        { status: 400 }
      );
    }

    if (imageFiles.length > 5) {
      return NextResponse.json(
        { success: false, error: "Maximum 5 images allowed" },
        { status: 400 }
      );
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of imageFiles) {
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`,
          },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds 10MB limit`,
          },
          { status: 400 }
        );
      }
    }

    // Extract tone preference
    const toneParam = formData.get("tone");
    const tone: DescriptionTone =
      toneParam && ["casual", "professional", "technical"].includes(toneParam as string)
        ? (toneParam as DescriptionTone)
        : "professional";

    console.log(`Analyzing ${imageFiles.length} product images with tone: ${tone}`);

    // Convert files to Gemini format
    const geminiImages = await filesToGeminiImages(imageFiles);

    // Analyze with AI
    const analysis = await analyzeProductPhotos(geminiImages, tone);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Product analysis error:", error);

    // Return user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze product images";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/admin/analyze-product
 *
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
