import {
  PackageDimensions,
  ServiceType,
  SERVICE_OPTIONS,
  PricingResult,
  DeliveryTiming,
} from "./types";

// Constants for pricing calculation
const BASE_RATE_PER_KG = 15; // GTQ (Guatemalan Quetzal) per kg
const DIMENSIONAL_WEIGHT_DIVISOR = 5000; // Standard: (L×W×H)/5000 for cm³ to kg
const MINIMUM_CHARGE = 25; // GTQ minimum charge

/**
 * Calculate dimensional weight using industry standard formula
 * Dimensional weight = (Length × Width × Height) / 5000
 */
export function calculateDimensionalWeight(
  dimensions: PackageDimensions
): number {
  const { length, width, height } = dimensions;
  return (length * width * height) / DIMENSIONAL_WEIGHT_DIVISOR;
}

/**
 * Determine chargeable weight (greater of actual weight or dimensional weight)
 */
export function getChargeableWeight(dimensions: PackageDimensions): number {
  const dimensionalWeight = calculateDimensionalWeight(dimensions);
  return Math.max(dimensions.weight, dimensionalWeight);
}

/**
 * Calculate estimated delivery date based on service type and timing
 */
export function calculateEstimatedDelivery(
  serviceType: ServiceType,
  deliveryTiming: DeliveryTiming,
  scheduledDate?: Date
): string {
  const today = new Date();
  let deliveryDate: Date;

  if (deliveryTiming === DeliveryTiming.SCHEDULED && scheduledDate) {
    deliveryDate = scheduledDate;
  } else {
    // Calculate based on service type
    const daysToAdd =
      serviceType === ServiceType.EXPRESS
        ? 2
        : serviceType === ServiceType.STANDARD
        ? 4
        : 7; // International

    deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  }

  return deliveryDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate shipping price with full breakdown
 */
export function calculateShippingPrice(
  dimensions: PackageDimensions,
  serviceType: ServiceType,
  deliveryTiming: DeliveryTiming,
  scheduledDate?: Date
): PricingResult {
  const dimensionalWeight = calculateDimensionalWeight(dimensions);
  const chargeableWeight = getChargeableWeight(dimensions);

  // Get service multiplier
  const service = SERVICE_OPTIONS.find((s) => s.value === serviceType);
  const serviceMultiplier = service?.multiplier || 1.0;

  // Calculate base price
  const basePrice = Math.max(
    chargeableWeight * BASE_RATE_PER_KG,
    MINIMUM_CHARGE
  );

  // Apply service multiplier
  const totalPrice = basePrice * serviceMultiplier;

  // Calculate estimated delivery
  const estimatedDelivery = calculateEstimatedDelivery(
    serviceType,
    deliveryTiming,
    scheduledDate
  );

  // Create breakdown
  const breakdown = [
    {
      label: "Actual Weight",
      value: `${dimensions.weight.toFixed(2)} kg`,
    },
    {
      label: "Dimensional Weight",
      value: `${dimensionalWeight.toFixed(2)} kg`,
    },
    {
      label: "Chargeable Weight",
      value: `${chargeableWeight.toFixed(2)} kg`,
    },
    {
      label: "Base Rate",
      value: `Q${basePrice.toFixed(2)}`,
    },
    {
      label: "Service Type",
      value: `${service?.label} (×${serviceMultiplier})`,
    },
  ];

  return {
    basePrice,
    serviceMultiplier,
    dimensionalWeight,
    chargeableWeight,
    totalPrice,
    estimatedDelivery,
    breakdown,
  };
}
