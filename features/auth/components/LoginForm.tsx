"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type SocialProvider = "github" | "google"

function signInWithProvider(provider: SocialProvider) {
  return authClient.signIn.social({
    provider,
    callbackURL: "/onboarding",
  })
}

export function LoginForm() {
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: (provider: SocialProvider) => signInWithProvider(provider),
    onSuccess: () => {
      router.push("/onboarding")
    },
    onError: error => {
      toast.error(error.message ?? "Failed to login")
    },
  })

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in with your preferred provider.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={() => mutate("github")} className="w-full" variant="outline" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in with GitHub"}
        </Button>
        <Button onClick={() => mutate("google")} className="w-full" variant="outline" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in with Google"}
        </Button>
      </CardContent>
    </Card>
  )
}
