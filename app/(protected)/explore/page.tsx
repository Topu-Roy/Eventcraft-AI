import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { CategoryTabs } from "@/features/discovery/components/CategoryTabs"
import { EventGrid, EventGridSkeleton } from "@/features/discovery/components/EventGrid"
import { SearchInput } from "@/features/discovery/components/SearchInput"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import type { Metadata } from "next"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Explore Events — EventCraft AI",
  description: "Discover events happening around you. Find meetups, conferences, and more.",
}

async function AllEventsSection() {
  const result = await tryCatch(fetchAuthQuery(api.discovery.getPublishedEvents, { limit: 100 }))
  const events = result.data?.data ?? []
  return <EventGrid title="All Events" events={events} />
}

async function PersonalizedOrTrending() {
  const authed = await isAuthenticated()

  if (authed) {
    const result = await tryCatch(fetchAuthQuery(api.discovery.getPersonalizedEvents, { limit: 50 }))
    let events = result.data?.data ?? []
    if (!events.length) {
      const fallback = await tryCatch(fetchAuthQuery(api.discovery.getPublishedEvents, { limit: 50 }))
      events = fallback.data?.data ?? []
    }
    return <EventGrid title="For You" events={events} showPagination={events.length > 12} />
  }

  const result = await tryCatch(fetchAuthQuery(api.discovery.getTrendingEvents, { limit: 50 }))
  let events = result.data?.data ?? []
  if (!events.length) {
    const fallback = await tryCatch(fetchAuthQuery(api.discovery.getPublishedEvents, { limit: 50 }))
    events = fallback.data?.data ?? []
  }
  return <EventGrid title="Trending" events={events} showPagination={events.length > 12} />
}

async function CategorySection() {
  const result = await tryCatch(fetchAuthQuery(api.categories.list))
  if (!result.data?.length) return null

  return <CategoryTabs />
}

function CategorySectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore Events</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Discover events happening around you.
            </p>
          </div>
          <SearchInput />
        </div>

        <Suspense fallback={<CategorySectionSkeleton />}>
          <CategorySection />
        </Suspense>

        <Suspense fallback={<EventGridSkeleton />}>
          <PersonalizedOrTrending />
        </Suspense>

        <Suspense fallback={<EventGridSkeleton />}>
          <AllEventsSection />
        </Suspense>
      </div>
    </div>
  )
}