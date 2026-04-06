"use client"

import { useMutation } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const { mutate: signOut, isPending } = useMutation({
    mutationFn: () => authClient.signOut(),
  })

  const handleSignOut = async () => {
    signOut(undefined, {
      onError(error) {
        if (error instanceof Error) {
          toast.error(error.message ?? "Failed to sign out")
        }
      },
      onSuccess() {
        router.refresh()
      },
    })
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleSignOut} disabled={isPending} aria-label="Sign out">
      <LogOut className="size-4" />
    </Button>
  )
}
