import { api } from "@/convex/_generated/api"
import { Calendar, LayoutDashboard, Plus, Search, Ticket } from "lucide-react"
import Link from "next/link"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "./LogoutButton"
import { MobileMenu } from "./MobileMenu"

export async function Header() {
  const authed = await isAuthenticated()
  const profileResult = authed ? await fetchAuthQuery(api.profiles.getCurrent) : null
  const profile = profileResult?.data ?? null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Calendar className="size-5 text-primary" />
            <span>EventAI</span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/explore"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Search className="size-3.5" />
              Explore
            </Link>

            {authed && (
              <>
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
          {authed ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  {profile?.name ?? "Profile"}
                </Button>
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <MobileMenu authed={authed} profile={profile} />
        </div>
      </div>
    </header>
  )
}
