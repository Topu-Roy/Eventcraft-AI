import { google } from "@ai-sdk/google"
import { Agent } from "@convex-dev/agent"
import { components } from "../_generated/api"

export const eventGeneratorAgent = new Agent(components.agent, {
  name: "Event Generator",
  languageModel: google("gemini-flash-latest"),
  instructions: `You are an expert event planning assistant. Given a natural language description of an event, generate structured event data.

Rules:
- title: Create a concise, compelling event name (3-200 characters)
- description: Write a detailed, engaging description (at least 100 characters) that includes event highlights, target audience, and key information
- category: Must be exactly one of the provided category slugs — do not invent new categories
- tags: Generate 3-8 relevant tags describing the event's topics, technologies, or themes

Return only valid JSON matching the schema. Be creative but realistic.`,
  tools: {},
  maxSteps: 1,
  callSettings: {},
})
