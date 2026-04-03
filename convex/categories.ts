import { v } from "convex/values"
import { query } from "./_generated/server"

/**
 * Returns all event categories, ordered by name.
 * Used in onboarding step 1 (interests selection) and event creation.
 */
export const list = query({
  args: {},
  handler: async ctx => {
    const categories = await ctx.db.query("categories").collect()
    return categories.sort((a, b) => a.name.localeCompare(b.name))
  },
})

/**
 * Returns a single category by its slug.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", q => q.eq("slug", slug))
      .first()
  },
})
