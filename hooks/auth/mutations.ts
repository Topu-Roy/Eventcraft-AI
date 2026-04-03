"use client"

import { useMutation } from "@tanstack/react-query"
import { type SupportedOAuthProvider } from "@/types/OAuthProviders"
import { authClient } from "@/lib/auth-client"

export function useSignInWithEmailMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authClient.signIn.email({
        email,
        password,
      }),
  })
}

export function useSignUpWithEmailMutation() {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authClient.signUp.email({
        email,
        password,
        name,
      }),
  })
}

export function useSignInWithOauthMutation() {
  return useMutation({
    mutationFn: ({ provider }: { provider: SupportedOAuthProvider }) =>
      authClient.signIn.social({
        provider,
      }),
  })
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: () => authClient.signOut(),
  })
}

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: ({ callbackURL }: { callbackURL: string }) => authClient.deleteUser({ callbackURL }),
  })
}

export function useLinkSocialProviderMutation() {
  return useMutation({
    mutationFn: ({ provider }: { provider: SupportedOAuthProvider }) => authClient.linkSocial({ provider }),
  })
}

export function useUnlinkSocialProviderMutation() {
  return useMutation({
    mutationFn: ({ accountId, providerId }: { accountId: string; providerId: SupportedOAuthProvider }) =>
      authClient.unlinkAccount({ accountId, providerId }),
  })
}

export function useAddPasskeyMutation() {
  return useMutation({
    mutationFn: ({ data }: { data: { name: string } }) => authClient.passkey.addPasskey(data),
  })
}

export function useDeletePasskeyMutation() {
  return useMutation({
    mutationFn: ({ passkeyId }: { passkeyId: string }) => authClient.passkey.deletePasskey({ id: passkeyId }),
  })
}

export function useRevokeSessionMutation() {
  return useMutation({
    mutationFn: ({ token }: { token: string }) => authClient.revokeSession({ token }),
  })
}

export function useRevokeOtherSessionsMutation() {
  return useMutation({
    mutationFn: () => authClient.revokeOtherSessions(),
  })
}
