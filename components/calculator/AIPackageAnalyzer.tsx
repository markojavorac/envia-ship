"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageUpload from "./ImageUpload";
import ConfidenceIndicator from "./ConfidenceIndicator";
import type { PackageAnalysis } from "@/lib/types/ai-analysis";
import type { ShippingFormValues } from "@/lib/validations/shipping-schema";

interface AIPackageAnalyzerProps {
  onAnalysisComplete: (formData: Partial<ShippingFormValues>) => void;
}

export default function AIPackageAnalyzer({
  onAnalysisComplete,
}: AIPackageAnalyzerProps) {
  const [images, setImages] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PackageAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        images.map(async (img) => {
          const reader = new FileReader();
          return new Promise<{ data: string; mimeType: string }>((resolve) => {
            reader.onloadend = () => {
              resolve({
                data: (reader.result as string).split(",")[1], // Remove data URL prefix
                mimeType: img.type,
              });
            };
            reader.readAsDataURL(img);
          });
        })
      );

      const response = await fetch("/api/analyze-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const analysis: PackageAnalysis = await response.json();
      setResult(analysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUseEstimates = () => {
    if (!result) return;

    const formData: Partial<ShippingFormValues> = {
      length: result.dimensions.length,
      width: result.dimensions.width,
      height: result.dimensions.height,
      weight: result.weight.estimate,
    };

    onAnalysisComplete(formData);
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="border-2 border-secondary/25 bg-white">
        <CardHeader className="pb-3 border-b border-secondary/10 bg-secondary/5">
          <CardTitle className="flex items-center gap-2 text-lg text-secondary">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            AI Package Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload photos of your package and let AI estimate dimensions and
            weight
          </p>

          <ImageUpload onImagesChange={setImages} />

          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={images.length === 0 || analyzing}
            className="w-full bg-primary text-white hover:bg-primary/90 shadow-lg font-semibold"
            size="lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Package...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Package ({images.length} photo
                {images.length !== 1 ? "s" : ""})
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <CheckCircle className="h-5 w-5" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Dimensions */}
            <div>
              <h4 className="font-semibold mb-2">Estimated Dimensions</h4>
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground">Length</p>
                  <p className="text-lg font-bold">{result.dimensions.length} cm</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground">Width</p>
                  <p className="text-lg font-bold">{result.dimensions.width} cm</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="text-lg font-bold">{result.dimensions.height} cm</p>
                </div>
              </div>
              <ConfidenceIndicator
                confidence={result.dimensions.confidence}
                label="Dimension confidence"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {result.dimensions.method}
              </p>
            </div>

            {/* Weight */}
            <div>
              <h4 className="font-semibold mb-2">Estimated Weight</h4>
              <div className="text-center p-3 bg-white rounded-lg mb-2">
                <p className="text-2xl font-bold">{result.weight.estimate} kg</p>
              </div>
              <ConfidenceIndicator
                confidence={result.weight.confidence}
                label="Weight confidence"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {result.weight.reasoning}
              </p>
            </div>

            {/* Characteristics */}
            <div className="p-3 bg-white rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shape:</span>
                <span className="font-semibold capitalize">
                  {result.characteristics.shape}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fragility:</span>
                <span className="font-semibold capitalize">
                  {result.characteristics.fragility}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stackable:</span>
                <span className="font-semibold">
                  {result.characteristics.stackable ? "Yes" : "No"}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            {result.characteristics.recommendations.length > 0 && (
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {result.characteristics.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use Estimates Button */}
            <Button
              onClick={handleUseEstimates}
              className="w-full bg-primary text-white hover:bg-primary/90"
              size="lg"
            >
              Use These Estimates in Manual Calculator
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
