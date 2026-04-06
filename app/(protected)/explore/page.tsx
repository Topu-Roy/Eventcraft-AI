import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { CategoryTabs } from "@/features/discovery/components/CategoryTabs"
import { EventCarousel, EventCarouselSkeleton } from "@/features/discovery/components/EventCarousel"
import { SearchInput } from "@/features/discovery/components/SearchInput"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { tryCatch } from "@/lib/try-catch"
import { Skeleton } from "@/components/ui/skeleton"

async function PersonalizedSection() {
  const result = await tryCatch(fetchAuthQuery(api.discovery.getPersonalizedEvents, { limit: 10 }))
  return (
    <EventCarousel
      title="For You"
      events={result.data ?? []}
      emptyMessage={result.error ? "Unable to load events" : "Complete onboarding to see personalized events"}
    />
  )
}

async function TrendingSection() {
  const result = await tryCatch(fetchAuthQuery(api.discovery.getTrendingEvents, { limit: 10 }))
  return (
    <EventCarousel
      title="Trending"
      events={result.data ?? []}
      emptyMessage={result.error ? "Unable to load events" : "No trending events right now"}
    />
  )
}

async function LocationSection() {
  const profileResult = await fetchAuthQuery(api.profiles.getCurrent)
  const profile = profileResult.data
  if (!profile?.location) return null

  const eventsResult = await tryCatch(
    fetchAuthQuery(api.discovery.getEventsByLocation, {
      city: profile.location.city,
      country: profile.location.country,
      limit: 10,
    })
  )

  if (!eventsResult.data?.length) return null

  return (
    <EventCarousel
      title={`Near ${profile.location.city}, ${profile.location.country}`}
      events={eventsResult.data}
      emptyMessage="No events near you"
    />
  )
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
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Explore Events</h1>
            <p className="mt-1 text-muted-foreground">Discover events happening around you.</p>
          </div>
          <SearchInput />
        </div>

        <Suspense fallback={<CategorySectionSkeleton />}>
          <CategorySection />
        </Suspense>

        <Suspense fallback={<EventCarouselSkeleton />}>
          <PersonalizedOrTrending />
        </Suspense>

        <Suspense fallback={<EventCarouselSkeleton />}>
          <LocationSection />
        </Suspense>
      </div>
    </div>
  )
}

async function PersonalizedOrTrending() {
  const authed = await isAuthenticated()

  if (authed) {
    return <PersonalizedSection />
  }

  return <TrendingSection />
}
