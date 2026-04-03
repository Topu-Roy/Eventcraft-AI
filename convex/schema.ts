import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const tables = {
  task: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.union(v.null(), v.string())),
    banExpires: v.optional(v.union(v.null(), v.number())),
  })
    .index("name", ["name"])
    .index("userId", ["userId"]),
}

const schema = defineSchema(tables)

export default schema
