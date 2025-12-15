/**
 * Mock zone data utilities
 *
 * Re-exports and wraps existing mock data infrastructure for zone analytics.
 * The delivery performance simulation is handled in aggregators.ts.
 */

import { generateMockOrders } from "@/lib/admin/mock-orders";
import type { Order } from "@/lib/marketplace/types";

/**
 * Generate mock orders for zone analytics
 *
 * Wrapper around existing generateMockOrders() function.
 * The mock data already includes weighted zone distribution:
 * - 60% to Zona 1, 4, 9 (high activity)
 * - 40% distributed across other zones
 *
 * Delivery performance metrics (success rate, delivery time) are
 * simulated in calculateZoneMetrics() within aggregators.ts based on
 * zone characteristics (business vs residential vs outskirts).
 */
export function generateMockZoneData(count: number = 225): Order[] {
  return generateMockOrders(count);
}

/**
 * Re-export for convenience
 */
export { generateMockOrders };
