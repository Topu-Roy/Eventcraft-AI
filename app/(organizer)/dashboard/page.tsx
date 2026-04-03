import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { Plus, Ticket } from "lucide-react"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Button } from "@/components/ui/button"
import { EventSelector } from "./EventSelector"

export default async function DashboardPage() {
  const events = await fetchAuthQuery(api.events.getMyEvents)

  if (!events?.length) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Manage your events and track performance.</p>
            </div>
          </div>

          <div className="space-y-4 py-12 text-center">
            <Ticket className="mx-auto size-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No events yet</h2>
            <p className="text-muted-foreground">Create your first event to see your dashboard.</p>
            <Button asChild>
              <a href="/organizer/events/create">
                <Plus className="mr-2 size-4" />
                Create Event
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage your events and track performance.</p>
          </div>
          <Button asChild>
            <a href="/organizer/events/create">
              <Plus className="mr-2 size-4" />
              Create Event
            </a>
          </Button>
        </div>

        <Suspense>
          <EventSelector events={events} />
        </Suspense>
      </div>
    </div>
  )
}
