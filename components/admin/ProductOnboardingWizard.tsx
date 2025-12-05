"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploadStep } from "./ImageUploadStep";
import { AnalyzingStep } from "./AnalyzingStep";
import { ReviewEditStep } from "./ReviewEditStep";
import { useAdmin } from "@/lib/admin/admin-context";
import { ProductAnalysis, DescriptionTone } from "@/lib/types/product-analysis";
import { ProductOnboardingFormData } from "@/lib/validations/product-onboarding-schema";
import { Product } from "@/lib/marketplace/types";
import { useToast } from "@/hooks/use-toast";

type WizardStep = "upload" | "analyzing" | "review";

export function ProductOnboardingWizard() {
  const router = useRouter();
  const { addProduct } = useAdmin();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setImageUrls(urls);
  };

  const handleContinueToAnalysis = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep("analyzing");
    setIsAnalyzing(true);

    try {
      // Prepare form data
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`image${index}`, file);
      });
      formData.append("tone", "professional"); // Default tone

      // Call API
      const response = await fetch("/api/admin/analyze-product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze product images");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Analysis failed");
      }

      setAnalysis(result.data);

      // Wait for animation to complete, then move to review
      setTimeout(() => {
        setCurrentStep("review");
        setIsAnalyzing(false);
      }, 500);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "Failed to analyze product images. Please try again.",
        variant: "destructive",
      });
      setCurrentStep("upload");
      setIsAnalyzing(false);
    }
  };

  const handleRegenerateDescription = async (tone: DescriptionTone) => {
    if (!analysis) return;

    try {
      // Prepare form data with same images but different tone
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`image${index}`, file);
      });
      formData.append("tone", tone);

      // Call API again with new tone
      const response = await fetch("/api/admin/analyze-product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate description");
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Regeneration failed");
      }

      // Update analysis with new descriptions
      setAnalysis(result.data);

      toast({
        title: "Description Updated",
        description: `Regenerated with ${tone} tone`,
      });
    } catch (error) {
      console.error("Regeneration error:", error);
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate description. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: ProductOnboardingFormData) => {
    try {
      // Convert form data to Product
      const product: Omit<Product, "id" | "rating" | "reviews" | "featured" | "createdAt"> = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        images: data.images,
        thumbnail: data.thumbnail,
        category: data.category,
        originZone: data.originZone,
        seller: data.seller || {
          name: "Admin Store",
          rating: 4.8,
          verified: true,
        },
        stock: data.stock,
        weight: data.weight,
        dimensions: data.dimensions,
        tags: data.tags,
      };

      // Add to admin context
      addProduct(product);

      toast({
        title: "Product Created",
        description: `${product.name} has been added to the marketplace`,
      });

      // Navigate to products page
      router.push("/admin/products");
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Failed to Create Product",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    // Clean up preview URLs
    imageUrls.forEach((url) => URL.revokeObjectURL(url));

    // Reset state
    setCurrentStep("upload");
    setSelectedFiles([]);
    setImageUrls([]);
    setAnalysis(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card border-border rounded-md">
        <CardContent className="pt-6 pb-6 px-6">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[
                { step: "upload", label: "Upload Photos" },
                { step: "analyzing", label: "AI Analysis" },
                { step: "review", label: "Review & Publish" },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full font-semibold text-sm ${
                      currentStep === item.step
                        ? "bg-primary text-white"
                        : index < ["upload", "analyzing", "review"].indexOf(currentStep)
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium text-foreground hidden md:inline">
                    {item.label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < ["upload", "analyzing", "review"].indexOf(currentStep)
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === "upload" && (
            <ImageUploadStep
              onImagesSelected={handleImagesSelected}
              onContinue={handleContinueToAnalysis}
            />
          )}

          {currentStep === "analyzing" && !analysis && (
            <AnalyzingStep />
          )}

          {currentStep === "review" && analysis && (
            <ReviewEditStep
              analysis={analysis}
              imageUrls={imageUrls}
              onSubmit={handleSubmit}
              onStartOver={handleStartOver}
              onRegenerateDescription={handleRegenerateDescription}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
