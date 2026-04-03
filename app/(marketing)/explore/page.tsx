import { Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryTabs } from "./CategoryTabs"
import { EventCarousel } from "./EventCarousel"
import { SearchInput } from "./SearchInput"

async function PersonalizedSection() {
  const events = await fetchAuthQuery(api.discovery.getPersonalizedEvents, { limit: 10 })
  return (
    <EventCarousel
      title="For You"
      events={events || []}
      emptyMessage="Complete onboarding to see personalized events"
    />
  )
}

function PersonalizedSectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

async function TrendingSection() {
  const events = await fetchAuthQuery(api.discovery.getTrendingEvents, { limit: 10 })
  return <EventCarousel title="Trending" events={events || []} emptyMessage="No trending events right now" />
}

async function LocationSection() {
  const user = await fetchAuthQuery(api.users.getCurrentUser)
  if (!user?.location) return null

  const events = await fetchAuthQuery(api.discovery.getEventsByLocation, {
    city: user.location.city,
    country: user.location.country,
    limit: 10,
  })

  if (!events?.length) return null

  return <EventCarousel title={`Near ${user.location.city}`} events={events} emptyMessage="No events near you" />
}

function LocationSectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

async function CategorySection() {
  const categories = await fetchAuthQuery(api.categories.list)
  if (!categories?.length) return null

  return <CategoryTabs categories={categories} />
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
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-lg" />
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

        <Suspense fallback={<PersonalizedSectionSkeleton />}>
          <PersonalizedOrTrending />
        </Suspense>

        <Suspense fallback={<LocationSectionSkeleton />}>
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
