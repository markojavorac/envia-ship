import { ProductCategory } from "../marketplace/types";

export interface ParsedQuery {
  priceRange?: { min?: number; max?: number };
  categories?: ProductCategory[];
  zones?: string[];
  serviceType?: "EXPRESS" | "STANDARD" | "INTERNATIONAL";
  searchTerms: string[];
}

/**
 * Parse natural language query into structured filters
 *
 * Examples:
 * - "pain relief under 200" → { categories: ['PHARMACY_MEDICAL'], priceRange: { max: 200 }, searchTerms: ['pain', 'relief'] }
 * - "coffee and snacks" → { categories: ['FOOD_BEVERAGES'], searchTerms: ['coffee', 'snacks'] }
 * - "delivery to zona 10" → { zones: ['zona-10'], searchTerms: [] }
 */
export function parseUserQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  const result: ParsedQuery = {
    searchTerms: [],
  };

  // Price extraction patterns
  const pricePatterns = [
    /under (\d+)/i,
    /less than (\d+)/i,
    /below (\d+)/i,
    /cheaper than (\d+)/i,
    /between (\d+) and (\d+)/i,
    /from (\d+) to (\d+)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = lower.match(pattern);
    if (match) {
      if (match[2]) {
        // Range pattern (between X and Y)
        result.priceRange = {
          min: parseInt(match[1]),
          max: parseInt(match[2]),
        };
      } else {
        // Max pattern (under X)
        result.priceRange = {
          max: parseInt(match[1]),
        };
      }
      break;
    }
  }

  // Category keyword mapping
  const categoryKeywords: Record<string, ProductCategory> = {
    // Medical/Pharmacy
    pain: "PHARMACY_MEDICAL",
    medicine: "PHARMACY_MEDICAL",
    medication: "PHARMACY_MEDICAL",
    "first aid": "PHARMACY_MEDICAL",
    vitamin: "PHARMACY_MEDICAL",
    health: "PHARMACY_MEDICAL",
    medical: "PHARMACY_MEDICAL",
    pharmacy: "PHARMACY_MEDICAL",
    bandage: "PHARMACY_MEDICAL",
    thermometer: "PHARMACY_MEDICAL",

    // Food/Beverages
    food: "FOOD_BEVERAGES",
    snack: "FOOD_BEVERAGES",
    drink: "FOOD_BEVERAGES",
    coffee: "FOOD_BEVERAGES",
    bread: "FOOD_BEVERAGES",
    juice: "FOOD_BEVERAGES",
    water: "FOOD_BEVERAGES",
    meal: "FOOD_BEVERAGES",
    hungry: "FOOD_BEVERAGES",
    eat: "FOOD_BEVERAGES",

    // Retail/Tech
    tech: "GENERAL_RETAIL",
    device: "GENERAL_RETAIL",
    speaker: "GENERAL_RETAIL",
    "power bank": "GENERAL_RETAIL",
    charger: "GENERAL_RETAIL",
    electronics: "GENERAL_RETAIL",
    gadget: "GENERAL_RETAIL",
  };

  // Detect categories
  const detectedCategories = new Set<ProductCategory>();
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (lower.includes(keyword)) {
      detectedCategories.add(category);
    }
  }

  if (detectedCategories.size > 0) {
    result.categories = Array.from(detectedCategories);
  }

  // Zone extraction (zona 10, zone-14, etc.)
  const zonePattern = /zona?\s*[-]?\s*(\d+)/gi;
  const zoneMatches = [...lower.matchAll(zonePattern)];
  if (zoneMatches.length > 0) {
    result.zones = zoneMatches.map((match) => `zona-${match[1]}`);
  }

  // Service type detection
  const serviceKeywords = {
    EXPRESS: ["express", "fast", "urgent", "asap", "quickly", "rush", "same day"],
    STANDARD: ["standard", "normal", "regular"],
    INTERNATIONAL: ["international", "overseas", "abroad"],
  };

  for (const [serviceType, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      result.serviceType = serviceType as "EXPRESS" | "STANDARD" | "INTERNATIONAL";
      break;
    }
  }

  // Extract search terms (words not used in filters)
  const filterWords = [
    "under",
    "over",
    "less",
    "more",
    "than",
    "between",
    "and",
    "to",
    "from",
    "delivery",
    "zone",
    "zona",
    "express",
    "fast",
    "urgent",
    "standard",
    "normal",
    "i",
    "need",
    "want",
    "looking",
    "for",
    "find",
    "get",
    "buy",
    "purchase",
    "a",
    "an",
    "the",
    "some",
    "any",
  ];

  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((word) => {
      if (word.length <= 2) return false;
      if (filterWords.includes(word)) return false;
      if (/^\d+$/.test(word)) return false; // Skip pure numbers
      return true;
    });

  result.searchTerms = words;

  return result;
}
