import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { productOnboardingSchema, type ProductOnboardingFormData } from "@/lib/validations/product-onboarding-schema";
import { ProductAnalysis, DescriptionTone, needsConfidenceWarning } from "@/lib/types/product-analysis";
import { ProductCategory, CATEGORY_OPTIONS } from "@/lib/marketplace/types";
import { GUATEMALA_ZONES } from "@/lib/types";
import { AlertCircle, RefreshCw, Loader2, Package, DollarSign, Ruler, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ReviewEditStepProps {
  analysis: ProductAnalysis;
  imageUrls: string[];
  onSubmit: (data: ProductOnboardingFormData) => void;
  onStartOver: () => void;
  onRegenerateDescription: (tone: DescriptionTone) => Promise<void>;
}

export function ReviewEditStep({
  analysis,
  imageUrls,
  onSubmit,
  onStartOver,
  onRegenerateDescription,
}: ReviewEditStepProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<DescriptionTone>(analysis.descriptionTone || "professional");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductOnboardingFormData>({
    resolver: zodResolver(productOnboardingSchema),
    defaultValues: {
      name: analysis.name,
      description: analysis.description || "",
      shortDescription: analysis.shortDescription || "",
      price: analysis.priceRange?.suggested || 0,
      category: analysis.category as ProductCategory,
      images: imageUrls,
      thumbnail: imageUrls[0],
      weight: analysis.weight.value / (analysis.weight.unit === "kg" ? 1 : 1000),
      dimensions: {
        length: analysis.dimensions.length,
        width: analysis.dimensions.width,
        height: analysis.dimensions.height,
      },
      tags: analysis.suggestedTags,
      stock: 0,
      originZone: "zona-10",
    },
  });

  const currentDescription = watch("description");
  const currentPrice = watch("price");

  const handleRegenerateDescription = async (tone: DescriptionTone) => {
    setIsRegenerating(true);
    setSelectedTone(tone);
    try {
      await onRegenerateDescription(tone);
      setValue("description", analysis.description || "");
      setValue("shortDescription", analysis.shortDescription || "");
    } finally {
      setIsRegenerating(false);
    }
  };

  const dimensionConfidenceWarning = needsConfidenceWarning(analysis.dimensions.confidence);
  const weightConfidenceWarning = needsConfidenceWarning(analysis.weight.confidence);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image Gallery */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-foreground">Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="aspect-square relative rounded-md overflow-hidden border-2 border-border">
                <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                {index === 0 && (
                  <div className="absolute top-1 left-1 px-2 py-0.5 bg-primary rounded-md text-xs text-white font-semibold">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Name & Category */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">Product Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="name" className="font-semibold">Product Name</Label>
            <Input
              id="name"
              {...register("name")}
              className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="font-semibold">Category</Label>
            <Select
              defaultValue={analysis.category as string}
              onValueChange={(value) => setValue("category", value as ProductCategory)}
            >
              <SelectTrigger className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Description</CardTitle>
            <div className="flex gap-2">
              {(["casual", "professional", "technical"] as DescriptionTone[]).map((tone) => (
                <Button
                  key={tone}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerateDescription(tone)}
                  disabled={isRegenerating}
                  className={cn(
                    "text-xs",
                    selectedTone === tone && "bg-primary/10 border-primary"
                  )}
                >
                  {isRegenerating && selectedTone === tone && (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  )}
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Full Description */}
          <div>
            <Label htmlFor="description" className="font-semibold">Full Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {currentDescription?.length || 0} / 1000 characters
            </p>
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <Label htmlFor="shortDescription" className="font-semibold">Short Description</Label>
            <Input
              id="shortDescription"
              {...register("shortDescription")}
              className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-500 mt-1">{errors.shortDescription.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">Pricing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Price Suggestion */}
          {analysis.priceRange && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
              <p className="text-sm font-semibold text-foreground mb-1">AI Suggested Range</p>
              <p className="text-2xl font-bold text-primary">
                Q{analysis.priceRange.min} - Q{analysis.priceRange.max}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.priceRange.reasoning}
              </p>
            </div>
          )}

          {/* Price Input */}
          <div>
            <Label htmlFor="price" className="font-semibold">Your Price (GTQ) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
              placeholder="Enter product price"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {currentPrice > 0 && `Q${currentPrice.toFixed(2)}`}
            </p>
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dimensions & Weight */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <Ruler className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">Dimensions & Weight</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dimensions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold">Dimensions (cm)</Label>
              <ConfidenceIndicator confidence={analysis.dimensions.confidence} size="sm" />
            </div>

            {dimensionConfidenceWarning && (
              <div className="flex items-start gap-2 p-2 bg-orange-500/5 border border-orange-500/20 rounded-md mb-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-orange-500">Low Confidence Warning</p>
                  <p className="text-xs text-muted-foreground">
                    Please verify dimensions are accurate. {analysis.dimensions.reasoning}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="length" className="text-xs">Length</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  {...register("dimensions.length", { valueAsNumber: true })}
                  className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {errors.dimensions?.length && (
                  <p className="text-xs text-red-500 mt-1">{errors.dimensions.length.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="width" className="text-xs">Width</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  {...register("dimensions.width", { valueAsNumber: true })}
                  className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {errors.dimensions?.width && (
                  <p className="text-xs text-red-500 mt-1">{errors.dimensions.width.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="height" className="text-xs">Height</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  {...register("dimensions.height", { valueAsNumber: true })}
                  className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {errors.dimensions?.height && (
                  <p className="text-xs text-red-500 mt-1">{errors.dimensions.height.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="weight" className="font-semibold">Weight (kg)</Label>
              <ConfidenceIndicator confidence={analysis.weight.confidence} size="sm" />
            </div>

            {weightConfidenceWarning && (
              <div className="flex items-start gap-2 p-2 bg-orange-500/5 border border-orange-500/20 rounded-md mb-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-orange-500">Low Confidence Warning</p>
                  <p className="text-xs text-muted-foreground">
                    Please verify weight is accurate. {analysis.weight.reasoning}
                  </p>
                </div>
              </div>
            )}

            <Input
              id="weight"
              type="number"
              step="0.01"
              {...register("weight", { valueAsNumber: true })}
              className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
            />
            {errors.weight && (
              <p className="text-sm text-red-500 mt-1">{errors.weight.message}</p>
            )}
          </div>

          {/* AI Notes */}
          {analysis.notes && analysis.notes.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs font-semibold text-foreground mb-1">AI Notes</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {analysis.notes.map((note, i) => (
                  <li key={i}>• {note}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags & Location */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">Tags & Location</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="font-semibold">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register("tags", {
                setValueAs: (v) => {
                  if (Array.isArray(v)) return v;
                  if (typeof v === "string") {
                    return v.split(",").map((t) => t.trim()).filter(Boolean);
                  }
                  return [];
                },
              })}
              defaultValue={analysis.suggestedTags.join(", ")}
              className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
              placeholder="coffee, guatemalan, premium"
            />
            {errors.tags && (
              <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>
            )}
          </div>

          {/* Origin Zone */}
          <div>
            <Label htmlFor="originZone" className="font-semibold">Origin Zone</Label>
            <Select
              defaultValue="zona-10"
              onValueChange={(value) => setValue("originZone", value)}
            >
              <SelectTrigger className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GUATEMALA_ZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.originZone && (
              <p className="text-sm text-red-500 mt-1">{errors.originZone.message}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <Label htmlFor="stock" className="font-semibold">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              {...register("stock", { valueAsNumber: true })}
              className="mt-1 bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onStartOver}
          className="border-2 border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Start Over
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white hover:bg-primary/90 font-semibold"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Publish Product
        </Button>
      </div>
    </form>
  );
}
