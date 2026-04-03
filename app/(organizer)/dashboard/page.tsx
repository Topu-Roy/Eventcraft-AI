import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { Layers, Plus, Ticket, TrendingUp, UserCheck, Users } from "lucide-react"
import { fetchAuthQuery } from "@/lib/auth-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EventSelector } from "./EventSelector"

function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: typeof Users
  label: string
  value: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          <span>{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

async function DashboardContent({ eventId }: { eventId: Id<"events"> }) {
  const analytics = await fetchAuthQuery(api.checkin.getEventAnalytics, { eventId })

  if (!analytics) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No analytics available for this event.</p>
      </div>
    )
  }

  const capacityText =
    typeof analytics.capacityRemaining === "number"
      ? `${analytics.capacityRemaining} spots left`
      : analytics.capacityRemaining

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Total Registered"
          value={analytics.totalRegistrations.toString()}
          subtitle="All time"
        />
        <KpiCard
          icon={UserCheck}
          label="Checked In"
          value={analytics.totalCheckedIn.toString()}
          subtitle={`${analytics.totalRegistrations > 0 ? Math.round((analytics.totalCheckedIn / analytics.totalRegistrations) * 100) : 0}% of total`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Engagement Rate"
          value={`${analytics.engagementRate}%`}
          subtitle="Check-in rate"
        />
        <KpiCard
          icon={Layers}
          label="Capacity Remaining"
          value={
            typeof analytics.capacityRemaining === "number" ? analytics.capacityRemaining.toString() : "Unlimited"
          }
          subtitle={capacityText}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Timeline</CardTitle>
          <CardDescription>Daily registration counts over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">Area chart coming soon</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="size-5" />
            Ticket Sales
          </CardTitle>
          <CardDescription>Coming with paid events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">Earnings analytics coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}

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

        <Suspense fallback={<DashboardContentSkeleton />}>
          <EventSelector events={events} />
        </Suspense>
      </div>
    </div>
  )
}
