import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { passkeyClient } from "@better-auth/passkey/client"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [convexClient(), passkeyClient(), adminClient()],
})
