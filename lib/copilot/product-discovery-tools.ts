import { MOCK_PRODUCTS } from "../marketplace/product-data";
import { filterProducts, sortProducts } from "../marketplace/product-filters";
import {
  enrichProductsWithShipping,
  calculateProductShipping,
} from "../marketplace/shipping-integration";
import { parseUserQuery } from "./query-parser";
import type { Product, ServiceType } from "../marketplace/types";

interface ToolContext {
  userZone: string;
  serviceType: ServiceType;
}

/**
 * Format search results for chat display
 */
function formatSearchResults(products: Product[], userZone: string): string {
  if (products.length === 0) {
    return "I couldn't find any products matching your criteria. Try adjusting your search terms or budget!";
  }

  let result = `I found ${products.length} product${products.length > 1 ? "s" : ""} for you:\n\n`;

  products.slice(0, 10).forEach((product, index) => {
    const shipping = calculateProductShipping(product, userZone, "STANDARD");
    result += `${index + 1}. **${product.name}** - Q${product.price}\n`;
    result += `   ${product.shortDescription || product.description}\n`;
    result += `   📦 Shipping: Q${shipping.cost.toFixed(2)} (${shipping.estimatedDays} days from ${product.originZone})\n`;
    result += `   ⭐ ${product.rating}/5 · Sold by ${product.seller.name}\n`;
    if (index < products.length - 1) result += "\n";
  });

  if (products.length > 10) {
    result += `\n...and ${products.length - 10} more products available!`;
  }

  return result;
}

/**
 * Product search tool - main discovery action
 */
export const productSearchTool = {
  name: "search_products",
  description:
    "Search for products based on user natural language query. Use this when the user asks to find products, needs something, or wants recommendations.",
  parameters: [
    {
      name: "query",
      type: "string",
      description:
        'User natural language search query (e.g., "pain relief under 200", "coffee and snacks")',
      required: true,
    },
  ],
  handler: async (args: { query: string }, context: ToolContext) => {
    const { query } = args;

    // Parse natural language query
    const parsed = parseUserQuery(query);

    // Build filter state
    const filterState: any = {
      searchQuery: parsed.searchTerms.join(" "),
    };

    if (parsed.categories && parsed.categories.length > 0) {
      filterState.category = parsed.categories[0]; // Use first detected category
    }

    if (parsed.priceRange) {
      filterState.priceRange = parsed.priceRange;
    }

    if (parsed.zones && parsed.zones.length > 0) {
      filterState.zones = parsed.zones;
    }

    // Filter products
    let filtered = filterProducts(MOCK_PRODUCTS, filterState);

    // Sort by relevance (rating * proximity)
    filtered = sortProducts(filtered, "relevance", context.userZone);

    // Enrich with shipping costs
    const withShipping = enrichProductsWithShipping(
      filtered.slice(0, 15), // Top 15 for enrichment
      context.userZone,
      context.serviceType
    );

    return formatSearchResults(withShipping, context.userZone);
  },
};

/**
 * Shipping explanation tool
 */
export const explainShippingTool = {
  name: "explain_shipping",
  description:
    "Explain shipping costs and delivery times for a specific product or zone. Use this when user asks about shipping prices, delivery times, or why shipping costs differ.",
  parameters: [
    {
      name: "productId",
      type: "string",
      description: "Product ID to explain shipping for (optional)",
      required: false,
    },
    {
      name: "zone",
      type: "string",
      description: 'Delivery zone to explain (optional, e.g., "zona-10")',
      required: false,
    },
  ],
  handler: async (args: { productId?: string; zone?: string }, context: ToolContext) => {
    const targetZone = args.zone || context.userZone;

    if (args.productId) {
      // Explain shipping for specific product
      const product = MOCK_PRODUCTS.find((p) => p.id === args.productId);

      if (!product) {
        return "I couldn't find that product. Can you provide the product name or search again?";
      }

      const shipping = calculateProductShipping(product, targetZone, context.serviceType);

      return (
        `**Shipping for ${product.name}**\n\n` +
        `From: ${product.originZone}\n` +
        `To: ${targetZone}\n` +
        `Service: ${context.serviceType}\n\n` +
        `**Cost Breakdown:**\n` +
        `- Base rate: Q${(shipping.cost / 2).toFixed(2)}\n` +
        `- Distance fee: Q${(shipping.cost / 2).toFixed(2)}\n` +
        `- **Total**: Q${shipping.cost.toFixed(2)}\n\n` +
        `**Delivery Time:** ${shipping.estimatedDays} days\n\n` +
        `💡 Tip: Products from ${targetZone} have the lowest shipping costs!`
      );
    } else {
      // General shipping explanation
      return (
        `**How Shipping Works at ENVÍA**\n\n` +
        `We use zone-based pricing across Guatemala City (Zona 1-16).\n\n` +
        `**Your delivery zone:** ${targetZone}\n` +
        `**Current service:** ${context.serviceType}\n\n` +
        `**Pricing factors:**\n` +
        `1. **Distance** - Closer zones = lower cost\n` +
        `2. **Service speed** - EXPRESS (1-2 days), STANDARD (3-5 days), INTERNATIONAL (5-10 days)\n` +
        `3. **Package weight** - Heavier items cost more\n\n` +
        `💡 Tip: Look for products from your zone (${targetZone}) for the best shipping rates!`
      );
    }
  },
};

/**
 * Product comparison tool
 */
export const compareProductsTool = {
  name: "compare_products",
  description:
    "Compare multiple products side-by-side. Use when user asks to compare specific products or wants to see differences.",
  parameters: [
    {
      name: "productNames",
      type: "string[]",
      description: "Array of product names to compare",
      required: true,
    },
  ],
  handler: async (args: { productNames: string[] }, context: ToolContext) => {
    const { productNames } = args;

    if (productNames.length < 2) {
      return "I need at least 2 products to compare. Can you specify the products you'd like to compare?";
    }

    // Find products by name (fuzzy matching)
    const products = productNames
      .map((name) => {
        const lower = name.toLowerCase();
        return MOCK_PRODUCTS.find(
          (p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower)
        );
      })
      .filter((p) => p !== undefined) as Product[];

    if (products.length === 0) {
      return "I couldn't find any of those products. Can you try different product names?";
    }

    if (products.length === 1) {
      return `I only found "${products[0].name}". Can you provide another product name to compare?`;
    }

    // Build comparison table
    let result = `**Product Comparison**\n\n`;

    products.forEach((product, idx) => {
      const shipping = calculateProductShipping(product, context.userZone, context.serviceType);
      const total = product.price + shipping.cost;

      result += `**${idx + 1}. ${product.name}**\n`;
      result += `- Price: Q${product.price}\n`;
      result += `- Shipping: Q${shipping.cost.toFixed(2)} (${shipping.estimatedDays} days)\n`;
      result += `- **Total: Q${total.toFixed(2)}**\n`;
      result += `- Rating: ⭐ ${product.rating}/5\n`;
      result += `- Seller: ${product.seller.name}${product.seller.verified ? " ✓" : ""}\n`;
      result += `- From: ${product.originZone}\n`;
      if (idx < products.length - 1) result += "\n";
    });

    // Find best value
    const withTotals = products.map((p) => {
      const shipping = calculateProductShipping(p, context.userZone, context.serviceType);
      return { product: p, total: p.price + shipping.cost };
    });

    const cheapest = withTotals.reduce((min, curr) => (curr.total < min.total ? curr : min));

    result += `\n\n💰 **Best value**: ${cheapest.product.name} at Q${cheapest.total.toFixed(2)} total`;

    return result;
  },
};
