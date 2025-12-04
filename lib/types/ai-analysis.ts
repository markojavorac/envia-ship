export interface PackageAnalysisRequest {
  images: { data: string; mimeType: string }[];
}

export interface DimensionEstimate {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  confidence: number; // 0-1
  method: string; // How dimensions were estimated
}

export interface WeightEstimate {
  estimate: number; // kg
  confidence: number; // 0-1
  reasoning: string;
}

export interface PackageCharacteristics {
  shape: "box" | "cylinder" | "irregular";
  fragility: "low" | "medium" | "high";
  stackable: boolean;
  recommendations: string[];
}

export interface PackageAnalysis {
  dimensions: DimensionEstimate;
  weight: WeightEstimate;
  characteristics: PackageCharacteristics;
  success: boolean;
  error?: string;
}
