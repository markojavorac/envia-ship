/* eslint-disable custom/no-admin-hardcoded-colors */
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
import {
  productOnboardingSchema,
  type ProductOnboardingFormData,
} from "@/lib/validations/product-onboarding-schema";
import {
  ProductAnalysis,
  DescriptionTone,
  needsConfidenceWarning,
} from "@/lib/types/product-analysis";
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
  const [selectedTone, setSelectedTone] = useState<DescriptionTone>(
    analysis.descriptionTone || "professional"
  );

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
          <CardTitle className="text-foreground text-lg font-bold">Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="border-border relative aspect-square overflow-hidden rounded-md border-2"
              >
                <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                {index === 0 && (
                  <div className="bg-primary absolute top-1 left-1 rounded-md px-2 py-0.5 text-xs font-semibold text-white">
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
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
              <Package className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-foreground text-lg font-bold">Product Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="name" className="text-foreground font-semibold">
              Product Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-foreground font-semibold">
              Category
            </Label>
            <Select
              defaultValue={analysis.category as string}
              onValueChange={(value) => setValue("category", value as ProductCategory)}
            >
              <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1">
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
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg font-bold">Description</CardTitle>
            <div className="flex gap-2">
              {(["casual", "professional", "technical"] as DescriptionTone[]).map((tone) => (
                <Button
                  key={tone}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerateDescription(tone)}
                  disabled={isRegenerating}
                  className={cn("text-xs", selectedTone === tone && "bg-primary/10 border-primary")}
                >
                  {isRegenerating && selectedTone === tone && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
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
            <Label htmlFor="description" className="text-foreground font-semibold">
              Full Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {currentDescription?.length || 0} / 1000 characters
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <Label htmlFor="shortDescription" className="text-foreground font-semibold">
              Short Description
            </Label>
            <Input
              id="shortDescription"
              {...register("shortDescription")}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
            />
            {errors.shortDescription && (
              <p className="mt-1 text-sm text-red-500">{errors.shortDescription.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-foreground text-lg font-bold">Pricing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Price Suggestion */}
          {analysis.priceRange && (
            <div className="bg-primary/5 border-primary/20 rounded-md border p-3">
              <p className="text-foreground mb-1 text-sm font-semibold">AI Suggested Range</p>
              <p className="text-primary text-2xl font-bold">
                Q{analysis.priceRange.min} - Q{analysis.priceRange.max}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{analysis.priceRange.reasoning}</p>
            </div>
          )}

          {/* Price Input */}
          <div>
            <Label htmlFor="price" className="text-foreground font-semibold">
              Your Price (GTQ) *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
              placeholder="Enter product price"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              {currentPrice > 0 && `Q${currentPrice.toFixed(2)}`}
            </p>
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Dimensions & Weight */}
      <Card className="bg-card border-border rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
              <Ruler className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-foreground text-lg font-bold">Dimensions & Weight</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dimensions */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-foreground font-semibold">Dimensions (cm)</Label>
              <ConfidenceIndicator confidence={analysis.dimensions.confidence} size="sm" />
            </div>

            {dimensionConfidenceWarning && (
              <div className="mb-3 flex items-start gap-2 rounded-md border border-orange-500/20 bg-orange-500/5 p-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                <div>
                  <p className="text-xs font-semibold text-orange-500">Low Confidence Warning</p>
                  <p className="text-muted-foreground text-xs">
                    Please verify dimensions are accurate. {analysis.dimensions.reasoning}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="length" className="text-foreground text-xs">
                  Length
                </Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  {...register("dimensions.length", { valueAsNumber: true })}
                  className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
                />
                {errors.dimensions?.length && (
                  <p className="mt-1 text-xs text-red-500">{errors.dimensions.length.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="width" className="text-foreground text-xs">
                  Width
                </Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  {...register("dimensions.width", { valueAsNumber: true })}
                  className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
                />
                {errors.dimensions?.width && (
                  <p className="mt-1 text-xs text-red-500">{errors.dimensions.width.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="height" className="text-foreground text-xs">
                  Height
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  {...register("dimensions.height", { valueAsNumber: true })}
                  className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
                />
                {errors.dimensions?.height && (
                  <p className="mt-1 text-xs text-red-500">{errors.dimensions.height.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="weight" className="text-foreground font-semibold">
                Weight (kg)
              </Label>
              <ConfidenceIndicator confidence={analysis.weight.confidence} size="sm" />
            </div>

            {weightConfidenceWarning && (
              <div className="mb-3 flex items-start gap-2 rounded-md border border-orange-500/20 bg-orange-500/5 p-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                <div>
                  <p className="text-xs font-semibold text-orange-500">Low Confidence Warning</p>
                  <p className="text-muted-foreground text-xs">
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
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
            />
            {errors.weight && <p className="mt-1 text-sm text-red-500">{errors.weight.message}</p>}
          </div>

          {/* AI Notes */}
          {analysis.notes && analysis.notes.length > 0 && (
            <div className="bg-card border-border rounded-md border p-3">
              <p className="text-foreground mb-1 text-xs font-semibold">AI Notes</p>
              <ul className="text-foreground space-y-1 text-xs">
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
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-foreground text-lg font-bold">Tags & Location</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="text-foreground font-semibold">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              {...register("tags", {
                setValueAs: (v) => {
                  if (Array.isArray(v)) return v;
                  if (typeof v === "string") {
                    return v
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                  }
                  return [];
                },
              })}
              defaultValue={analysis.suggestedTags.join(", ")}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
              placeholder="coffee, guatemalan, premium"
            />
            {errors.tags && <p className="mt-1 text-sm text-red-500">{errors.tags.message}</p>}
          </div>

          {/* Origin Zone */}
          <div>
            <Label htmlFor="originZone" className="text-foreground font-semibold">
              Origin Zone
            </Label>
            <Select defaultValue="zona-10" onValueChange={(value) => setValue("originZone", value)}>
              <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1">
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
              <p className="mt-1 text-sm text-red-500">{errors.originZone.message}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <Label htmlFor="stock" className="text-foreground font-semibold">
              Stock Quantity
            </Label>
            <Input
              id="stock"
              type="number"
              {...register("stock", { valueAsNumber: true })}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 mt-1"
              placeholder="0"
            />
            {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onStartOver}
          className="border-border hover:bg-muted border-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 font-semibold text-white"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish Product
        </Button>
      </div>
    </form>
  );
}
