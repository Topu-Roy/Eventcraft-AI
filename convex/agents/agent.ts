import { google } from "@ai-sdk/google"
import { Agent } from "@convex-dev/agent"
import { components } from "../_generated/api"

export const chatAgent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: google("gemini-flash-latest"),
  instructions: "You are a weather forecaster.",
  tools: {},
  maxSteps: 3,
  callSettings: {},
})
