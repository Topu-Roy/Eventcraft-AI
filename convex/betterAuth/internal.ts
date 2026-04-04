import { v } from "convex/values"
import { internalQuery } from "./_generated/server"

/**
 * Internal query to check if a BetterAuth user has the admin role.
 * Called from app-level mutations/queries that need admin verification.
 */
export const checkAdminRole = internalQuery({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .withIndex("userId", q => q.eq("userId", args.authId))
      .first()
    return user?.role === "admin"
  },
})
