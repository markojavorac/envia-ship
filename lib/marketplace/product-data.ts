import { Product, ProductCategory } from "./types";
import { GUATEMALA_ZONES } from "@/lib/types";

// Product Templates by Category
const PRODUCT_TEMPLATES = {
  [ProductCategory.FOOD_BEVERAGES]: [
    { name: "Organic Coffee Beans", priceRange: [80, 150], weightRange: [0.5, 1.5], dims: [15, 20, 10], tags: ["organic", "local", "fresh"] },
    { name: "Fresh Fruit Basket", priceRange: [120, 200], weightRange: [2, 5], dims: [30, 30, 20], tags: ["fresh", "seasonal", "healthy"] },
    { name: "Artisan Bread", priceRange: [25, 50], weightRange: [0.5, 1], dims: [30, 15, 10], tags: ["fresh", "local", "daily"] },
    { name: "Premium Chocolate Box", priceRange: [100, 180], weightRange: [0.3, 0.8], dims: [20, 15, 5], tags: ["premium", "gift", "imported"] },
    { name: "Natural Honey Jar", priceRange: [60, 120], weightRange: [0.5, 1.2], dims: [12, 12, 15], tags: ["organic", "local", "pure"] },
    { name: "Freshly Roasted Chicken", priceRange: [70, 130], weightRange: [1.5, 3], dims: [25, 20, 15], tags: ["fresh", "ready-to-eat", "hot"] },
    { name: "Tropical Juice Pack", priceRange: [45, 85], weightRange: [1, 2.5], dims: [20, 15, 25], tags: ["fresh", "natural", "cold"] },
    { name: "Gourmet Cheese Selection", priceRange: [90, 160], weightRange: [0.5, 1.2], dims: [25, 20, 8], tags: ["premium", "imported", "fresh"] },
    { name: "Fresh Vegetable Box", priceRange: [55, 95], weightRange: [2, 4], dims: [35, 25, 20], tags: ["organic", "fresh", "local"] },
    { name: "Craft Beer Pack", priceRange: [110, 180], weightRange: [2, 4], dims: [30, 20, 30], tags: ["craft", "local", "premium"] },
    { name: "Homemade Tortillas", priceRange: [20, 40], weightRange: [0.3, 0.8], dims: [25, 25, 5], tags: ["fresh", "traditional", "daily"] },
    { name: "Artisan Pasta Pack", priceRange: [50, 90], weightRange: [0.5, 1], dims: [25, 15, 10], tags: ["artisan", "imported", "premium"] },
    { name: "Fresh Seafood Selection", priceRange: [150, 280], weightRange: [1, 2.5], dims: [30, 25, 15], tags: ["fresh", "premium", "cold"] },
    { name: "Organic Tea Set", priceRange: [70, 130], weightRange: [0.2, 0.5], dims: [20, 15, 10], tags: ["organic", "imported", "gift"] },
    { name: "Breakfast Combo Pack", priceRange: [85, 150], weightRange: [1.5, 3], dims: [30, 25, 20], tags: ["combo", "fresh", "value"] },
  ],
  [ProductCategory.PHARMACY_MEDICAL]: [
    { name: "Complete First Aid Kit", priceRange: [150, 300], weightRange: [1, 2], dims: [25, 20, 15], tags: ["essential", "certified", "complete"] },
    { name: "Multivitamin Pack", priceRange: [80, 150], weightRange: [0.3, 0.8], dims: [10, 10, 15], tags: ["health", "daily", "certified"] },
    { name: "Digital Thermometer", priceRange: [50, 120], weightRange: [0.2, 0.4], dims: [15, 10, 5], tags: ["medical-grade", "digital", "accurate"] },
    { name: "Blood Pressure Monitor", priceRange: [200, 450], weightRange: [0.8, 1.5], dims: [20, 18, 10], tags: ["medical-grade", "home-use", "certified"] },
    { name: "Pain Relief Medication", priceRange: [40, 90], weightRange: [0.1, 0.3], dims: [10, 8, 3], tags: ["certified", "effective", "trusted"] },
    { name: "Surgical Face Masks Box", priceRange: [35, 70], weightRange: [0.3, 0.6], dims: [15, 12, 8], tags: ["certified", "protective", "disposable"] },
    { name: "Hand Sanitizer Pack", priceRange: [45, 85], weightRange: [0.5, 1.2], dims: [20, 15, 10], tags: ["antibacterial", "certified", "safe"] },
    { name: "Wound Care Kit", priceRange: [60, 130], weightRange: [0.4, 0.9], dims: [18, 15, 8], tags: ["complete", "sterile", "certified"] },
    { name: "Allergy Relief Package", priceRange: [70, 140], weightRange: [0.2, 0.5], dims: [12, 10, 8], tags: ["effective", "certified", "fast-acting"] },
    { name: "Baby Care Essentials", priceRange: [120, 230], weightRange: [1, 2.5], dims: [30, 25, 20], tags: ["gentle", "certified", "complete"] },
    { name: "Prenatal Vitamins", priceRange: [90, 170], weightRange: [0.3, 0.7], dims: [10, 10, 12], tags: ["certified", "essential", "trusted"] },
    { name: "Diabetes Test Kit", priceRange: [180, 350], weightRange: [0.5, 1], dims: [20, 15, 10], tags: ["medical-grade", "accurate", "certified"] },
    { name: "Muscle Pain Relief Gel", priceRange: [55, 110], weightRange: [0.2, 0.5], dims: [15, 8, 5], tags: ["effective", "fast-acting", "certified"] },
    { name: "Immune Booster Supplement", priceRange: [75, 145], weightRange: [0.3, 0.7], dims: [10, 10, 15], tags: ["natural", "certified", "effective"] },
    { name: "Pulse Oximeter", priceRange: [120, 250], weightRange: [0.1, 0.3], dims: [10, 8, 5], tags: ["medical-grade", "accurate", "portable"] },
  ],
  [ProductCategory.GENERAL_RETAIL]: [
    { name: "Bluetooth Wireless Speaker", priceRange: [200, 500], weightRange: [0.5, 1.5], dims: [15, 15, 15], tags: ["wireless", "portable", "quality-sound"] },
    { name: "Desk Organizer Set", priceRange: [50, 120], weightRange: [0.5, 1], dims: [25, 15, 10], tags: ["office", "organization", "modern"] },
    { name: "LED Reading Lamp", priceRange: [80, 180], weightRange: [0.6, 1.2], dims: [20, 20, 40], tags: ["energy-efficient", "adjustable", "modern"] },
    { name: "Smartphone Power Bank", priceRange: [100, 220], weightRange: [0.3, 0.7], dims: [12, 8, 2], tags: ["portable", "fast-charging", "reliable"] },
    { name: "Wireless Keyboard & Mouse", priceRange: [150, 350], weightRange: [0.8, 1.5], dims: [40, 20, 5], tags: ["wireless", "ergonomic", "quality"] },
    { name: "Water Bottle Set", priceRange: [45, 95], weightRange: [0.4, 0.9], dims: [25, 10, 10], tags: ["eco-friendly", "reusable", "durable"] },
    { name: "Premium Notebook Set", priceRange: [40, 85], weightRange: [0.5, 1], dims: [25, 20, 3], tags: ["quality-paper", "professional", "elegant"] },
    { name: "Travel Backpack", priceRange: [180, 400], weightRange: [0.8, 1.8], dims: [40, 30, 15], tags: ["durable", "spacious", "comfortable"] },
    { name: "Wireless Earbuds", priceRange: [250, 600], weightRange: [0.1, 0.2], dims: [10, 10, 5], tags: ["wireless", "noise-canceling", "premium"] },
    { name: "Smart Watch", priceRange: [350, 800], weightRange: [0.2, 0.5], dims: [15, 12, 8], tags: ["fitness", "smart", "stylish"] },
    { name: "Home Security Camera", priceRange: [220, 520], weightRange: [0.4, 0.9], dims: [15, 12, 12], tags: ["smart", "wifi", "security"] },
    { name: "Electric Kettle", priceRange: [120, 280], weightRange: [1, 2], dims: [20, 20, 25], tags: ["fast", "automatic", "safe"] },
    { name: "Yoga Mat & Accessories", priceRange: [90, 180], weightRange: [1, 2.5], dims: [70, 15, 15], tags: ["fitness", "non-slip", "portable"] },
    { name: "Kitchen Knife Set", priceRange: [150, 350], weightRange: [1.5, 3], dims: [35, 25, 10], tags: ["professional", "sharp", "durable"] },
    { name: "Portable Fan", priceRange: [70, 160], weightRange: [0.5, 1.2], dims: [20, 20, 10], tags: ["portable", "rechargeable", "quiet"] },
  ],
};

// Seller name generators
const SELLER_PREFIXES = ["Casa de", "Tienda", "Mercado", "Boutique", "Comercial", "Farmacia", "Distribuidora"];
const SELLER_NAMES = ["María", "Carlos", "Guatemala", "Central", "Express", "Premium", "Moderna", "Popular"];

// Utility Functions
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max));
}

function randomZone(): string {
  const allZones = [...GUATEMALA_ZONES];
  const zone = randomFromArray(allZones);
  return zone.value;
}

function generateSellerName(): string {
  return `${randomFromArray(SELLER_PREFIXES)} ${randomFromArray(SELLER_NAMES)}`;
}

function generateDescription(name: string, category: ProductCategory): string {
  const categoryDescriptions = {
    [ProductCategory.FOOD_BEVERAGES]: `Fresh ${name} delivered to your door. Perfect for your daily needs. Sourced from trusted suppliers in Guatemala City.`,
    [ProductCategory.PHARMACY_MEDICAL]: `High-quality ${name} from certified suppliers. Safe, reliable, and professionally handled. Fast delivery to your zone.`,
    [ProductCategory.GENERAL_RETAIL]: `Premium ${name} available for quick delivery. Quality guaranteed with warranty. Trusted by customers across Guatemala City.`,
  };
  return categoryDescriptions[category];
}

function generateShortDescription(name: string): string {
  return `Premium ${name} available for delivery`;
}

function generatePlaceholderUrl(category: ProductCategory, seed: number): string {
  // Use placehold.co with category-specific colors
  const colors = {
    [ProductCategory.FOOD_BEVERAGES]: "FF8C00/FFFFFF", // Orange background, white text
    [ProductCategory.PHARMACY_MEDICAL]: "1E3A5F/FFFFFF", // Navy background, white text
    [ProductCategory.GENERAL_RETAIL]: "FF8C00/1E3A5F", // Orange background, navy text
  };

  const labels = {
    [ProductCategory.FOOD_BEVERAGES]: "Food",
    [ProductCategory.PHARMACY_MEDICAL]: "Medical",
    [ProductCategory.GENERAL_RETAIL]: "Retail",
  };

  return `https://placehold.co/400x400/${colors[category]}/png?text=${labels[category]}`;
}

function randomPastDate(daysAgo: number = 90): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomIntInRange(0, daysAgo));
  return date;
}

// Main Product Generator
function generateMockProducts(count: number = 70): Product[] {
  const products: Product[] = [];
  const categories = Object.keys(PRODUCT_TEMPLATES) as ProductCategory[];

  // Distribute products across categories
  const productsPerCategory = Math.floor(count / categories.length);

  categories.forEach((category, catIndex) => {
    const templates = PRODUCT_TEMPLATES[category];
    const numProducts = catIndex === categories.length - 1
      ? count - products.length  // Last category gets remaining products
      : productsPerCategory;

    for (let i = 0; i < numProducts; i++) {
      const template = templates[i % templates.length];
      const productNum = products.length + 1;
      const seed = productNum * 1000 + catIndex * 100;

      const price = randomInRange(template.priceRange[0], template.priceRange[1]);
      const weight = randomInRange(template.weightRange[0], template.weightRange[1]);

      products.push({
        id: `product-${productNum}`,
        name: i < templates.length ? template.name : `${template.name} ${String.fromCharCode(65 + Math.floor(i / templates.length))}`,
        description: generateDescription(template.name, category),
        shortDescription: generateShortDescription(template.name),
        price: Math.round(price * 100) / 100,  // Round to 2 decimals
        images: [
          generatePlaceholderUrl(category, seed),
          generatePlaceholderUrl(category, seed + 1),
          generatePlaceholderUrl(category, seed + 2),
        ],
        thumbnail: generatePlaceholderUrl(category, seed),
        category,
        originZone: randomZone(),
        seller: {
          name: generateSellerName(),
          rating: randomInRange(3.5, 5.0),
          verified: Math.random() > 0.3,  // 70% verified
        },
        stock: randomIntInRange(0, 50),
        weight: Math.round(weight * 100) / 100,
        dimensions: {
          length: template.dims[0],
          width: template.dims[1],
          height: template.dims[2],
        },
        rating: randomInRange(3.0, 5.0),
        reviews: randomIntInRange(5, 200),
        tags: template.tags,
        featured: Math.random() > 0.8,  // 20% featured
        createdAt: randomPastDate(),
      });
    }
  });

  return products;
}

// Generate and export products
export const MOCK_PRODUCTS = generateMockProducts(70);

// Helper function to get products by category
export function getProductsByCategory(category: ProductCategory | "all"): Product[] {
  if (category === "all") return MOCK_PRODUCTS;
  return MOCK_PRODUCTS.filter(p => p.category === category);
}

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find(p => p.id === id);
}

// Helper function to get featured products
export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter(p => p.featured);
}
