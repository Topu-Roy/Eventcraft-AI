import { components } from "@/convex/_generated/api"
import authConfig from "@/convex/auth.config"
import type { DataModel } from "@/convex/betterAuth/_generated/dataModel"
import schema from "@/convex/betterAuth/schema"
import { passkey } from "@better-auth/passkey"
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import type { GenericCtx } from "@convex-dev/better-auth/utils"
import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(components.betterAuth, {
  local: { schema },
  verbose: false,
})

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    appName: "My App",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    // Session cookie for client-side caching
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60, // 1 minute
      },
    },
    plugins: [convex({ authConfig }), admin(), passkey()],
  } satisfies BetterAuthOptions
}

// For `auth` CLI
export const options = createAuthOptions({} as GenericCtx<DataModel>)

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx))
}
