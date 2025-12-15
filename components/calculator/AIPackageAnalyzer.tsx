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

export default function AIPackageAnalyzer({ onAnalysisComplete }: AIPackageAnalyzerProps) {
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
      <Card className="border-secondary/25 bg-card border-2">
        <CardHeader className="border-border border-b pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            AI Package Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-4">
          <p className="text-muted-foreground text-sm">
            Upload photos of your package and let AI estimate dimensions and weight
          </p>

          <ImageUpload onImagesChange={setImages} />

          {error && (
            <div className="bg-destructive/10 border-destructive/50 flex items-start gap-2 rounded-lg border p-3">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={images.length === 0 || analyzing}
            className="bg-primary hover:bg-primary/90 w-full font-semibold text-white shadow-lg"
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
        <Card className="border-primary/30 bg-primary/5 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            {/* Dimensions */}
            <div>
              <h4 className="text-foreground mb-2 font-semibold">Estimated Dimensions</h4>
              <div className="mb-2 grid grid-cols-3 gap-3">
                <div className="bg-card rounded-lg p-2 text-center">
                  <p className="text-muted-foreground text-xs">Length</p>
                  <p className="text-lg font-bold">{result.dimensions.length} cm</p>
                </div>
                <div className="bg-card rounded-lg p-2 text-center">
                  <p className="text-muted-foreground text-xs">Width</p>
                  <p className="text-lg font-bold">{result.dimensions.width} cm</p>
                </div>
                <div className="bg-card rounded-lg p-2 text-center">
                  <p className="text-muted-foreground text-xs">Height</p>
                  <p className="text-lg font-bold">{result.dimensions.height} cm</p>
                </div>
              </div>
              <ConfidenceIndicator
                confidence={result.dimensions.confidence}
                label="Dimension confidence"
              />
              <p className="text-muted-foreground mt-1 text-xs">{result.dimensions.method}</p>
            </div>

            {/* Weight */}
            <div>
              <h4 className="text-foreground mb-2 font-semibold">Estimated Weight</h4>
              <div className="bg-card mb-2 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{result.weight.estimate} kg</p>
              </div>
              <ConfidenceIndicator
                confidence={result.weight.confidence}
                label="Weight confidence"
              />
              <p className="text-muted-foreground mt-1 text-xs">{result.weight.reasoning}</p>
            </div>

            {/* Characteristics */}
            <div className="bg-card space-y-2 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shape:</span>
                <span className="font-semibold capitalize">{result.characteristics.shape}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fragility:</span>
                <span className="font-semibold capitalize">{result.characteristics.fragility}</span>
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
              <div className="bg-card rounded-lg p-3">
                <h4 className="text-foreground mb-2 text-sm font-semibold">Recommendations</h4>
                <ul className="space-y-1">
                  {result.characteristics.recommendations.map((rec, i) => (
                    <li key={i} className="text-muted-foreground text-sm">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use Estimates Button */}
            <Button
              onClick={handleUseEstimates}
              className="bg-primary hover:bg-primary/90 w-full text-white"
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
