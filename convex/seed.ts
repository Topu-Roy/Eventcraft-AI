import { mutation } from "./_generated/server"

/**
 * Seeds the categories table with default event categories.
 * Run once via `npx convex run seed:categories`.
 * Idempotent — skips categories that already exist.
 */
export const seedCategories = mutation({
  args: {},
  handler: async ctx => {
    const existing = await ctx.db.query("categories").collect()
    if (existing.length > 0) {
      return { skipped: existing.length, message: "Categories already exist" }
    }

    const categories = [
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

    let created = 0
    for (const cat of categories) {
      await ctx.db.insert("categories", cat)
      created++
    }

    return { created, message: `Seeded ${created} categories` }
  },
})
