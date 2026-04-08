"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import type { Doc } from "@/convex/_generated/dataModel"
import { LayoutDashboard, LogOut, Plus, Settings, Ticket, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ProfileMenuProps = {
  profile: Doc<"profile"> | null
}

export function ProfileMenu({ profile }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { mutate: signOut, isPending } = useMutation({
    mutationFn: () => authClient.signOut(),
  })

  const handleSignOut = () => {
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

  const initials =
    profile?.name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U"

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-9 p-0">
          <Avatar className="size-9">
            <AvatarImage src={profile?.avatarUrl ?? ""} alt={profile?.name ?? "User"} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{profile?.name ?? "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.location ? `${profile.location.city}, ${profile.location.country}` : "No location set"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tickets" className="cursor-pointer">
            <Ticket className="mr-2 size-4" />
            My Tickets
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/events/create" className="cursor-pointer">
            <Plus className="mr-2 size-4" />
            Create Event
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          {isPending ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
