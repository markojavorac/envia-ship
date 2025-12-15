import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const serviceAdapter = new GoogleGenerativeAIAdapter({
  model: "gemini-1.5-flash",
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

const copilotRuntime = new CopilotRuntime({
  actions: [
    // Actions are registered on the frontend via useCopilotAction
    // This runtime just provides the infrastructure
  ],
});

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter,
    endpoint: "/api/copilot",
  });

  return handleRequest(req);
}
