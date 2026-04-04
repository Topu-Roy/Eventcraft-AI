"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider: "github",
        callbackURL: "/onboarding",
      }),
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
        <CardDescription>Enter your email and password to login.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => mutate()} className="w-full" disabled={isPending}>
          {isPending ? "Logging in..." : "Sign in with Github"}
        </Button>
      </CardContent>
    </Card>
  )
}
