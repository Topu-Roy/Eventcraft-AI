"use client"

import { LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button variant="ghost" size="icon-sm" onClick={() => authClient.signOut()} aria-label="Sign out">
      <LogOut className="size-4" />
    </Button>
  )
}
