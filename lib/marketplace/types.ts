import { ServiceType } from "@/lib/types";

// UI Variations
export enum MarketplaceView {
  AMAZON = "amazon",
  UBER_EATS = "ubereats",
  PINTEREST = "pinterest",
  MINIMALIST = "minimalist",
  PROXIMITY = "proximity",
}

export const VIEW_OPTIONS = [
  {
    value: MarketplaceView.AMAZON,
    label: "Classic Grid",
    description: "Detailed product listings with filters"
  },
  {
    value: MarketplaceView.UBER_EATS,
    label: "Visual Cards",
    description: "Browse by category with delivery focus"
  },
  {
    value: MarketplaceView.PINTEREST,
    label: "Image Wall",
    description: "Visual discovery with large images"
  },
  {
    value: MarketplaceView.MINIMALIST,
    label: "Minimalist",
    description: "Clean & spacious design"
  },
  {
    value: MarketplaceView.PROXIMITY,
    label: "Local Focus",
    description: "Zone-based browsing"
  },
] as const;

// Product Categories
export enum ProductCategory {
  FOOD_BEVERAGES = "food_beverages",
  PHARMACY_MEDICAL = "pharmacy_medical",
  GENERAL_RETAIL = "general_retail",
}

export const CATEGORY_OPTIONS = [
  {
    value: ProductCategory.FOOD_BEVERAGES,
    label: "Food & Beverages",
    icon: "coffee"
  },
  {
    value: ProductCategory.PHARMACY_MEDICAL,
    label: "Pharmacy & Medical",
    icon: "pill"
  },
  {
    value: ProductCategory.GENERAL_RETAIL,
    label: "General Retail",
    icon: "shopping-bag"
  },
] as const;

// Product Interface
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;                    // Product price in GTQ
  images: string[];                 // Array of image URLs
  thumbnail: string;                // Primary thumbnail
  category: ProductCategory;
  originZone: string;               // "zona-10", "zona-1", etc.
  seller: {
    name: string;
    rating: number;                 // 0-5
    verified: boolean;
  };
  stock: number;                    // Available quantity
  weight: number;                   // kg (for shipping calculation)
  dimensions: {
    length: number;                 // cm
    width: number;                  // cm
    height: number;                 // cm
  };
  rating: number;                   // Product rating 0-5
  reviews: number;                  // Review count
  tags: string[];                   // ["fresh", "organic", "local", etc.]
  featured: boolean;                // Featured product flag
  createdAt: Date;
}

// Shipping Estimate
export interface ShippingEstimate {
  cost: number;                     // GTQ
  serviceType: ServiceType;
  estimatedDays: number;
  fromZone: string;
  toZone: string;
}

// Product with Shipping
export interface ProductWithShipping extends Product {
  shippingEstimate: ShippingEstimate | null;
}

// Filter State
export interface FilterState {
  category: ProductCategory | "all";
  priceRange: { min: number; max: number };
  zones: string[];                  // Filter by origin zones
  inStock: boolean;
  minRating: number;
  searchQuery: string;
}

// Sort Options
export enum SortOption {
  RELEVANCE = "relevance",
  PRICE_LOW = "price_low",
  PRICE_HIGH = "price_high",
  RATING = "rating",
  NEWEST = "newest",
  NEAREST = "nearest",              // Sort by proximity to user's zone
}

export const SORT_OPTIONS = [
  { value: SortOption.RELEVANCE, label: "Relevance" },
  { value: SortOption.PRICE_LOW, label: "Price: Low to High" },
  { value: SortOption.PRICE_HIGH, label: "Price: High to Low" },
  { value: SortOption.RATING, label: "Highest Rated" },
  { value: SortOption.NEWEST, label: "Newest" },
  { value: SortOption.NEAREST, label: "Nearest to Me" },
] as const;

// Checkout Form Data
export interface CheckoutFormData {
  productId: string;
  quantity: number;
  deliveryZone: string;
  deliveryAddress: string;
  serviceType: ServiceType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

// Order
export interface Order {
  id: string;
  product: Product;
  quantity: number;
  productTotal: number;
  shippingCost: number;
  totalCost: number;
  deliveryZone: string;
  deliveryAddress: string;
  serviceType: ServiceType;
  estimatedDelivery: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}

// User Preferences
export interface UserPreferences {
  deliveryZone: string | null;
  preferredView: MarketplaceView;
  preferredServiceType: ServiceType;
}
