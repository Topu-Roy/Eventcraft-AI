import { type GoogleLanguageModelOptions } from "@ai-sdk/google"
import { v } from "convex/values"
import { array, enum as enum_, object, string } from "zod"
import { action } from "../_generated/server"
import { chatAgent } from "./agent"

const schema = object({
  title: string(),
  summary: string(),
  tags: array(string()),
  sentiment: enum_(["positive", "negative", "neutral"]),
})

export const analyzeText = action({
  args: { text: v.string(), threadId: v.string() },
  handler: async (ctx, { text, threadId }) => {
    const { thread } = await chatAgent.continueThread(ctx, { threadId })

    const { object } = await thread.generateObject({
      prompt: `Analyze this text: ${text}`,
      schema, // zod schema
      schemaName: "Analysis", // optional, helps the LLM
      schemaDescription: "Text analysis result",
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingLevel: "high",
            includeThoughts: true,
          },
        } satisfies GoogleLanguageModelOptions,
      },
    })

    // object is fully typed as z.infer<typeof schema>
    return object
  },
})
