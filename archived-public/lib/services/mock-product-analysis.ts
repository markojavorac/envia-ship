import { ProductCategory } from "@/lib/marketplace/types";
import { ProductAnalysis, DescriptionTone, PriceRange } from "@/lib/types/product-analysis";

/**
 * Mock product analysis data for testing
 * Simulates Gemini API responses without making actual API calls
 */

const MOCK_PRODUCTS = {
  coffee: {
    name: "Café Quetzal Premium Ground Coffee 340g",
    brand: "Café Quetzal",
    category: ProductCategory.FOOD_BEVERAGES,
    dimensions: {
      length: 12,
      width: 8,
      height: 6,
      unit: "cm" as const,
      confidence: 0.85,
      reasoning: "Measured against smartphone reference (assumed iPhone ~15cm height)",
    },
    weight: {
      value: 340,
      unit: "g" as const,
      confidence: 0.95,
      reasoning: "Clearly printed on product label",
    },
    features: [
      "100% Guatemalan coffee",
      "Medium roast",
      "Ground for drip/French press",
      "High altitude grown",
      "Rich chocolate and citrus notes",
    ],
    extractedText: [
      "Café Quetzal",
      "Peso Neto: 340g",
      "Tostado medio",
      "Producto de Guatemala",
      "Medium Roast",
    ],
    packaging: "Vacuum-sealed bag",
    fragility: "medium" as const,
    suggestedTags: ["coffee", "guatemalan", "premium", "ground", "medium-roast"],
    notes: [
      "High-quality product photos with clear labeling",
      "Professional packaging design",
      "Contains visible nutrition/ingredient information",
    ],
    priceRange: {
      min: 75,
      max: 95,
      suggested: 85,
      currency: "GTQ" as const,
      reasoning: "Based on similar premium Guatemalan coffee products",
    },
  },

  vitamins: {
    name: "Vitamin C 1000mg - 60 Tablets",
    brand: "VitaHealth",
    category: ProductCategory.PHARMACY_MEDICAL,
    dimensions: {
      length: 6,
      width: 6,
      height: 11,
      unit: "cm" as const,
      confidence: 0.78,
      reasoning: "Standard supplement bottle size",
    },
    weight: {
      value: 120,
      unit: "g" as const,
      confidence: 0.82,
      reasoning: "Estimated from bottle size and tablet count",
    },
    features: [
      "1000mg per tablet",
      "60-day supply",
      "Immune support",
      "Citrus-flavored",
      "Easy to swallow",
    ],
    extractedText: ["Vitamin C", "1000mg", "60 Tablets", "Expire: 12/2026", "Dietary Supplement"],
    packaging: "Plastic bottle",
    fragility: "sturdy" as const,
    suggestedTags: ["vitamins", "immune", "health", "supplements", "wellness"],
    notes: [
      "Medical product - expiration date visible (12/2026)",
      "Clear dosage information",
      "Suitable for standard shipping",
    ],
    priceRange: {
      min: 45,
      max: 65,
      suggested: 55,
      currency: "GTQ" as const,
      reasoning: "Competitive pricing for vitamin C supplements",
    },
  },

  electronics: {
    name: "Wireless Bluetooth Earbuds",
    brand: "TechSound",
    category: ProductCategory.GENERAL_RETAIL,
    dimensions: {
      length: 8,
      width: 8,
      height: 3,
      unit: "cm" as const,
      confidence: 0.72,
      reasoning: "Measured against packaging reference",
    },
    weight: {
      value: 150,
      unit: "g" as const,
      confidence: 0.68,
      reasoning: "Estimated from packaging size and materials",
    },
    features: [
      "Bluetooth 5.0",
      "24-hour battery life",
      "Noise cancellation",
      "Touch controls",
      "Charging case included",
    ],
    extractedText: ["Wireless Earbuds", "Bluetooth 5.0", "24h Battery", "Model: TS-200"],
    packaging: "Retail box",
    fragility: "fragile" as const,
    suggestedTags: ["electronics", "audio", "wireless", "bluetooth", "earbuds"],
    notes: [
      "Electronic device - handle with care",
      "Fragile packaging detected",
      "Recommend standard shipping (not express due to fragility)",
    ],
    priceRange: {
      min: 180,
      max: 250,
      suggested: 215,
      currency: "GTQ" as const,
      reasoning: "Mid-range wireless earbuds market price",
    },
  },
};

const DESCRIPTIONS = {
  coffee: {
    casual:
      "This amazing Guatemalan coffee is roasted to perfection and tastes incredible! Perfect for your morning routine with rich chocolate and citrus flavors. Your coffee maker will thank you!",
    professional:
      "Premium Guatemalan ground coffee sourced from high-altitude plantations in the western highlands. Medium roast profile delivers a rich, full-bodied flavor with notes of chocolate and citrus. Perfect for drip coffee makers and French press brewing methods.",
    technical:
      "Single-origin Arabica coffee from high-altitude Guatemalan plantations (1,200-1,600m elevation). Medium roast (Full City) with SCA cupping score of 85+. Grind size optimized for drip and immersion brewing. 340g net weight, vacuum-sealed for freshness.",
  },
  vitamins: {
    casual:
      "Boost your immune system with these easy-to-swallow Vitamin C tablets! 1000mg of goodness in each pill, and you get a full 60-day supply. Your body will love you for it!",
    professional:
      "High-potency Vitamin C supplement providing 1000mg per tablet for comprehensive immune system support. Each bottle contains 60 citrus-flavored tablets, offering a two-month supply. Suitable for daily wellness routines and immune health maintenance.",
    technical:
      "Ascorbic acid supplement formulated at 1000mg per unit dose. 60-tablet supply (2-month regimen at 1 tablet/day). Citrus-flavored chewable formulation. Expiration: December 2026. Meets USP standards for Vitamin C supplements.",
  },
  electronics: {
    casual:
      "These wireless earbuds are perfect for music lovers! Super long battery life, crystal clear sound, and they block out all that annoying background noise. Plus they look really cool!",
    professional:
      "Premium wireless earbuds featuring Bluetooth 5.0 connectivity and advanced noise cancellation technology. Enjoy up to 24 hours of playback time with the included charging case. Intuitive touch controls provide seamless operation for calls and music.",
    technical:
      "Bluetooth 5.0 wireless earbuds (Model: TS-200) with active noise cancellation (ANC). 24-hour total battery capacity (6h earbuds + 18h charging case). Touch-sensitive controls for playback and call management. Frequency response: 20Hz-20kHz. IPX4 water resistance.",
  },
};

/**
 * Simulate AI processing delay (500-1500ms)
 */
function simulateProcessingDelay(): Promise<void> {
  const delay = Math.random() * 1000 + 500; // 500-1500ms
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Detect product type from image metadata (mock logic)
 * In production, this would analyze actual image content
 */
function detectProductType(imageCount: number): keyof typeof MOCK_PRODUCTS {
  // Simple mock: rotate through product types based on image count
  const types: Array<keyof typeof MOCK_PRODUCTS> = ["coffee", "vitamins", "electronics"];
  return types[imageCount % 3];
}

/**
 * Generate mock AI analysis for product photos
 */
export async function mockAnalyzeProductPhotos(
  images: File[] | string[],
  tone: DescriptionTone = "professional"
): Promise<ProductAnalysis> {
  // Simulate processing time
  await simulateProcessingDelay();

  // Detect product type (mock)
  const productType = detectProductType(images.length);
  const mockData = MOCK_PRODUCTS[productType];
  const descriptions = DESCRIPTIONS[productType];

  // Generate short description (first sentence of full description)
  const fullDescription = descriptions[tone];
  const shortDescription = fullDescription.split(".")[0] + ".";

  return {
    ...mockData,
    description: fullDescription,
    shortDescription,
    descriptionTone: tone,
  };
}

/**
 * Generate mock description with specific tone
 */
export async function mockGenerateDescription(
  productName: string,
  features: string[],
  tone: DescriptionTone
): Promise<{ description: string; shortDescription: string }> {
  // Simulate processing time
  await simulateProcessingDelay();

  // Determine product type from name
  let productType: keyof typeof DESCRIPTIONS = "coffee";
  if (productName.toLowerCase().includes("vitamin")) {
    productType = "vitamins";
  } else if (
    productName.toLowerCase().includes("earbud") ||
    productName.toLowerCase().includes("electronic")
  ) {
    productType = "electronics";
  }

  const description = DESCRIPTIONS[productType][tone];
  const shortDescription = description.split(".")[0] + ".";

  return { description, shortDescription };
}

/**
 * Generate mock pricing suggestions
 */
export async function mockSuggestPricing(
  category: ProductCategory,
  productName: string
): Promise<PriceRange> {
  // Simulate processing time
  await simulateProcessingDelay();

  // Simple mock pricing based on category
  const pricingRanges: Record<ProductCategory, PriceRange> = {
    [ProductCategory.FOOD_BEVERAGES]: {
      min: 30,
      max: 150,
      suggested: 85,
      currency: "GTQ",
      reasoning: "Based on similar food and beverage products",
    },
    [ProductCategory.PHARMACY_MEDICAL]: {
      min: 40,
      max: 300,
      suggested: 120,
      currency: "GTQ",
      reasoning: "Based on similar medical and health products",
    },
    [ProductCategory.GENERAL_RETAIL]: {
      min: 50,
      max: 500,
      suggested: 200,
      currency: "GTQ",
      reasoning: "Based on similar retail products",
    },
  };

  return pricingRanges[category];
}

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AI === "true";
}
