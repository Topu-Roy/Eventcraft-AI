"use client"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { LayoutDashboard, Plus, Search, Settings, Ticket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "./MobileMenu"
import { ProfileMenu } from "./ProfileMenu"

const LOGO_SVG = "/assets/images/logo.svg"

export function Header() {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const isAdmin = profile?.role === "admin"

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
                <Image src={LOGO_SVG} alt="EventCraft" fill className="object-cover" />
              </div>
              <span className="hidden text-lg font-bold tracking-tight sm:inline">EventCraft AI</span>
              <span className="text-lg font-bold tracking-tight sm:hidden">EventAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
              <Image src={LOGO_SVG} alt="EventCraft" fill className="object-cover" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">EventCraft AI</span>
            <span className="text-lg font-bold tracking-tight sm:hidden">EventAI</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex lg:gap-4">
            <Link
              href="/explore"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Search className="size-3.5" />
              Explore
            </Link>

            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="size-3.5" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </Link>
                <Link
                  href="/events/create"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Create
                </Link>
                <Link
                  href="/tickets"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Ticket className="size-3.5" />
                  My Tickets
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <ProfileMenu profile={profile} />
          ) : (
            <Link href="/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <MobileMenu authed={isAuthenticated} profile={profile} />
        </div>
      </div>
    </header>
  )
}