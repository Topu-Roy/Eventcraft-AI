import { mutation, query } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"

const DEFAULT_CATEGORIES = [
  { name: "Technology", slug: "technology", iconName: "cpu", colorToken: "blue" },
  { name: "Music", slug: "music", iconName: "music", colorToken: "purple" },
  { name: "Art & Design", slug: "art-design", iconName: "palette", colorToken: "pink" },
  { name: "Sports", slug: "sports", iconName: "trophy", colorToken: "orange" },
  { name: "Food & Drink", slug: "food-drink", iconName: "utensils", colorToken: "amber" },
  { name: "Business", slug: "business", iconName: "briefcase", colorToken: "slate" },
  { name: "Health & Wellness", slug: "health-wellness", iconName: "heart", colorToken: "green" },
  { name: "Education", slug: "education", iconName: "book-open", colorToken: "indigo" },
  { name: "Social & Community", slug: "social-community", iconName: "users", colorToken: "teal" },
  { name: "Gaming", slug: "gaming", iconName: "gamepad-2", colorToken: "violet" },
]

/**
 * Seeds the categories table with default event categories.
 * Admin only — verifies the caller's role via BetterAuth admin plugin.
 * Idempotent — skips categories that already exist.
 */
export const seedCategories = mutation({
  args: {},
  handler: async ctx => {
    const baUser = await authComponent.getAuthUser(ctx as never)
    if (baUser.role !== "admin") throw new Error("Admin access required")

    const existing = await ctx.db.query("categories").collect()
    if (existing.length > 0) {
      return { skipped: existing.length, message: "Categories already exist" }
    }

    let created = 0
    for (const cat of DEFAULT_CATEGORIES) {
      await ctx.db.insert("categories", cat)
      created++
    }

    return { created, message: `Seeded ${created} categories` }
  },
})

/**
 * Returns whether the current user is an admin via BetterAuth admin plugin.
 * Used by the frontend to conditionally show the seed button.
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    try {
      const baUser = await authComponent.getAuthUser(ctx as never)
      return baUser.role === "admin"
    } catch {
      return false
    }
  },
})
