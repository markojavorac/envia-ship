import { calculateShippingPrice } from "@/lib/shipping-calculator";
import { ServiceType, DeliveryTiming } from "@/lib/types";
import type { Product, ShippingEstimate, ProductWithShipping } from "./types";

/**
 * Get estimated delivery days based on service type
 */
function getEstimatedDays(serviceType: ServiceType): number {
  switch (serviceType) {
    case ServiceType.EXPRESS:
      return 2;
    case ServiceType.STANDARD:
      return 4;
    case ServiceType.INTERNATIONAL:
      return 7;
    default:
      return 4;
  }
}

/**
 * Calculate shipping cost for a single product
 * Integrates with existing shipping calculator
 */
export function calculateProductShipping(
  product: Product,
  deliveryZone: string,
  serviceType: ServiceType = ServiceType.STANDARD
): ShippingEstimate | null {
  if (!deliveryZone) return null;

  try {
    // Use existing calculator with product dimensions
    const result = calculateShippingPrice(
      {
        length: product.dimensions.length,
        width: product.dimensions.width,
        height: product.dimensions.height,
        weight: product.weight,
      },
      serviceType,
      DeliveryTiming.ASAP
    );

    return {
      cost: result.totalPrice,
      serviceType,
      estimatedDays: getEstimatedDays(serviceType),
      fromZone: product.originZone,
      toZone: deliveryZone,
    };
  } catch (error) {
    console.error("Error calculating shipping for product:", product.id, error);
    return null;
  }
}

/**
 * Enrich multiple products with shipping estimates
 * Batch operation for efficiency
 */
export function enrichProductsWithShipping(
  products: Product[],
  userZone: string | null,
  serviceType: ServiceType = ServiceType.STANDARD
): ProductWithShipping[] {
  return products.map((product) => ({
    ...product,
    shippingEstimate: userZone
      ? calculateProductShipping(product, userZone, serviceType)
      : null,
  }));
}

/**
 * Calculate total cost (product + shipping)
 */
export function calculateTotalCost(
  productPrice: number,
  quantity: number,
  shippingCost: number
): number {
  return productPrice * quantity + shippingCost;
}

/**
 * Format price in GTQ
 */
export function formatPrice(price: number): string {
  return `Q${price.toFixed(2)}`;
}

/**
 * Get delivery time description
 */
export function getDeliveryTimeDescription(estimatedDays: number): string {
  if (estimatedDays === 0) return "Today";
  if (estimatedDays === 1) return "Tomorrow";
  if (estimatedDays === 2) return "1-2 days";
  if (estimatedDays <= 4) return `${estimatedDays - 1}-${estimatedDays} days`;
  return `${estimatedDays - 2}-${estimatedDays} days`;
}

/**
 * Check if product can be delivered same day (same zone)
 */
export function canDeliverToday(productZone: string, userZone: string): boolean {
  return productZone === userZone;
}
