"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import type { Doc } from "@/convex/_generated/dataModel"
import { Calendar, LayoutDashboard, LogOut, Menu, Plus, Search, Ticket, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type MobileMenuProps = {
  authed: boolean
  profile: Doc<"profile"> | null
}

export function MobileMenu({ authed, profile }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

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

  function closeMenu() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            EventAI
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col gap-2">
          <Link href="/explore" onClick={closeMenu}>
            <Button variant="ghost" className="w-full justify-start">
              <Search className="mr-2 size-4" />
              Explore
            </Button>
          </Link>

          {authed && (
            <>
              <Link href="/dashboard" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/events/create" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="mr-2 size-4" />
                  Create Event
                </Button>
              </Link>
              <Link href="/tickets" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  <Ticket className="mr-2 size-4" />
                  My Tickets
                </Button>
              </Link>
            </>
          )}

          {authed ? (
            <div className="mt-4 space-y-2 border-t pt-4">
              <Link href="/profile" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 size-4" />
                  {profile?.name ?? "Profile"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleSignOut}
                disabled={isPending}
              >
                <LogOut className="mr-2 size-4" />
                {isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2 border-t pt-4">
              <Link href="/sign-in" onClick={closeMenu}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
