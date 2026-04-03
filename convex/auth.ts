import { query as betterAuthQuery } from "./betterAuth/_generated/server"
import { authComponent } from "./betterAuth/auth"

export const getUserInfo = betterAuthQuery({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: true, cause: "Unauthenticated" } as const

    const user = await authComponent.getAuthUser(ctx)

    return { error: null, data: user }
  },
})
