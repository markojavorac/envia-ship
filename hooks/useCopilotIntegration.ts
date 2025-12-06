"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import {
  productSearchTool,
  explainShippingTool,
  compareProductsTool,
} from "@/lib/copilot/product-discovery-tools";

/**
 * Hook to integrate copilot tools with marketplace context
 *
 * This hook:
 * 1. Exposes marketplace state to the copilot (zone, service type, filters)
 * 2. Registers product discovery tools
 * 3. Automatically passes context to tool handlers
 */
export function useCopilotIntegration() {
  const { userZone, serviceType, filterState } = useMarketplace();

  // Make marketplace context readable to copilot
  useCopilotReadable({
    description: "User's current delivery zone and service preferences for shipping calculations",
    value: {
      userZone,
      serviceType,
      currentFilters: filterState,
    },
  });

  // Register product search action
  useCopilotAction({
    name: productSearchTool.name,
    description: productSearchTool.description,
    parameters: productSearchTool.parameters,
    handler: async (args) => {
      return productSearchTool.handler(args, {
        userZone,
        serviceType,
      });
    },
  });

  // Register shipping explanation action
  useCopilotAction({
    name: explainShippingTool.name,
    description: explainShippingTool.description,
    parameters: explainShippingTool.parameters,
    handler: async (args) => {
      return explainShippingTool.handler(args, {
        userZone,
        serviceType,
      });
    },
  });

  // Register product comparison action
  useCopilotAction({
    name: compareProductsTool.name,
    description: compareProductsTool.description,
    parameters: compareProductsTool.parameters,
    handler: async (args) => {
      return compareProductsTool.handler(args, {
        userZone,
        serviceType,
      });
    },
  });
}
