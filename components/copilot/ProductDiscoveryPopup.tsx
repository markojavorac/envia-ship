"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotIntegration } from "@/hooks/useCopilotIntegration";
import "@copilotkit/react-ui/styles.css";

/**
 * Product Discovery Copilot - Main component
 *
 * Renders a chat popup in the bottom-right corner that helps users:
 * - Find products through natural language
 * - Understand shipping costs
 * - Compare products
 * - Get personalized recommendations
 */
export function ProductDiscoveryPopup() {
  return (
    <CopilotKit runtimeUrl="/api/copilot" showDevConsole={false}>
      <ProductDiscoveryContent />
    </CopilotKit>
  );
}

function ProductDiscoveryContent() {
  // Register all product discovery tools
  useCopilotIntegration();

  return (
    <CopilotPopup
      instructions={`You are a helpful shopping assistant for ENVÍA's marketplace in Guatemala City.

**Your role:**
- Help users find products through natural conversation
- Explain shipping costs and delivery times
- Compare products when asked
- Provide personalized recommendations based on their delivery zone

**Available products:**
- Food & Beverages: Coffee, bread, snacks, drinks
- Pharmacy & Medical: First aid kits, vitamins, pain relief, thermometers
- General Retail: Speakers, power banks, chargers, electronics

**Key features:**
- Zone-based shipping (Zona 1-16 in Guatemala City)
- EXPRESS (1-2 days), STANDARD (3-5 days), INTERNATIONAL (5-10 days) service
- Products from the user's zone have the lowest shipping costs

**Tone:**
- Friendly and conversational
- Concise but informative
- Focus on finding the perfect products
- Always mention shipping costs and delivery times
- Use emojis sparingly (📦 for shipping, ⭐ for ratings, 💰 for price)

**Important:**
- Always consider the user's current delivery zone for shipping estimates
- Mention when products are nearby (same zone) for faster/cheaper delivery
- Suggest alternatives if nothing matches their criteria`}
      labels={{
        title: "Shopping Assistant",
        initial: "Hey! Can I help you find anything? 🛍️",
        placeholder: "E.g., 'I need pain relief and snacks under 500 GTQ'",
      }}
      defaultOpen={false}
    />
  );
}
