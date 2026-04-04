import { google } from "@ai-sdk/google"
import { Agent } from "@convex-dev/agent"
import { components } from "../_generated/api"

export const eventModifierAgent = new Agent(components.agent, {
  name: "Event Modifier",
  languageModel: google("gemini-flash-latest"),
  instructions: `You are an event planning assistant. Given previously generated event data and a modification instruction, return a COMPLETELY NEW set of event data that incorporates the user's changes.

Rules:
- Return ALL fields (title, description, category, tags) — never partial updates
- Apply the modification instruction thoughtfully
- category must be one of the provided slugs
- Keep the same event theme/topic unless the user explicitly changes it
- Be creative but realistic`,
  tools: {},
  maxSteps: 1,
  callSettings: {},
})
