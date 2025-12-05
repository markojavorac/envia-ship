import { ProductCategory } from "@/lib/marketplace/types";

/**
 * AI confidence level for measurements and predictions
 */
export type ConfidenceLevel = number; // 0.0 to 1.0

/**
 * Fragility assessment for shipping recommendations
 */
export type FragilityLevel = "fragile" | "medium" | "sturdy";

/**
 * Description tone options for AI-generated content
 */
export type DescriptionTone = "casual" | "professional" | "technical";

/**
 * Dimension measurement with confidence scoring
 */
export interface DimensionMeasurement {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  unit: "cm";
  confidence: ConfidenceLevel;
  reasoning?: string;
}

/**
 * Weight measurement with confidence scoring
 */
export interface WeightMeasurement {
  value: number; // grams or kg
  unit: "g" | "kg";
  confidence: ConfidenceLevel;
  reasoning?: string;
}

/**
 * Price range suggestion based on market analysis
 */
export interface PriceRange {
  min: number;
  max: number;
  suggested: number;
  currency: "GTQ";
  reasoning?: string;
}

/**
 * Complete AI analysis result for product photos
 */
export interface ProductAnalysis {
  // Product identification
  name: string;
  brand?: string;
  category: ProductCategory | string;

  // Physical characteristics
  dimensions: DimensionMeasurement;
  weight: WeightMeasurement;

  // Product details
  features: string[];
  extractedText: string[];
  packaging: string;
  fragility: FragilityLevel;

  // AI suggestions
  suggestedTags: string[];
  notes: string[];

  // Pricing insights (optional)
  priceRange?: PriceRange;

  // Generated descriptions
  description?: string;
  shortDescription?: string;
  descriptionTone?: DescriptionTone;
}

/**
 * Request payload for product analysis API
 */
export interface AnalyzeProductRequest {
  images: File[] | string[]; // Files or base64 strings
  tone?: DescriptionTone;
  includePrice?: boolean;
  existingProducts?: Array<{ name: string; category: string; price: number }>;
}

/**
 * Response from product analysis API
 */
export interface AnalyzeProductResponse {
  success: boolean;
  data?: ProductAnalysis;
  error?: string;
}

/**
 * Request for regenerating specific fields
 */
export interface RegenerateFieldRequest {
  field: "description" | "name" | "tags" | "price";
  currentData: Partial<ProductAnalysis>;
  tone?: DescriptionTone;
}

/**
 * Confidence indicator visual representation
 */
export interface ConfidenceIndicator {
  level: ConfidenceLevel;
  label: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  color: "red" | "orange" | "yellow" | "green" | "emerald";
  stars: 1 | 2 | 3 | 4 | 5;
}

/**
 * Helper function to get confidence indicator details
 */
export function getConfidenceIndicator(confidence: ConfidenceLevel): ConfidenceIndicator {
  if (confidence >= 0.9) {
    return { level: confidence, label: "Very High", color: "emerald", stars: 5 };
  } else if (confidence >= 0.7) {
    return { level: confidence, label: "High", color: "green", stars: 4 };
  } else if (confidence >= 0.5) {
    return { level: confidence, label: "Medium", color: "yellow", stars: 3 };
  } else if (confidence >= 0.3) {
    return { level: confidence, label: "Low", color: "orange", stars: 2 };
  } else {
    return { level: confidence, label: "Very Low", color: "red", stars: 1 };
  }
}

/**
 * Convert weight to kilograms (standardized unit)
 */
export function normalizeWeight(weight: WeightMeasurement): number {
  if (weight.unit === "kg") {
    return weight.value;
  }
  return weight.value / 1000; // Convert grams to kg
}

/**
 * Check if confidence is below warning threshold
 */
export function needsConfidenceWarning(confidence: ConfidenceLevel): boolean {
  return confidence < 0.5;
}
