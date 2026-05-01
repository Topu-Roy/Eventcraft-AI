"use client"

import { useState, Suspense } from "react"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { useSearchParams } from "next/navigation"
import { CategoryTabs } from "@/features/discovery/components/CategoryTabs"
import { EventGrid } from "@/features/discovery/components/EventGrid"
import { SearchInput } from "@/features/discovery/components/SearchInput"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

function AllEventsSection() {
  const result = useQuery(api.discovery.getPublishedEvents, { limit: 100 })
  const events = result?.data ?? []
  return <EventGrid title="All Events" events={events} />
}

function PersonalizedSection() {
  const result = useQuery(api.discovery.getPersonalizedEvents, { limit: 50 })
  let events = result?.data ?? []

  if (!events.length || result?.error) {
    const fallback = useQuery(api.discovery.getPublishedEvents, { limit: 50 })
    events = fallback?.data ?? []
    return <EventGrid title="Trending" events={events} showPagination={events.length > 12} />
  }

  return <EventGrid title="For You" events={events} showPagination={events.length > 12} />
}

function TrendingSection() {
  const result = useQuery(api.discovery.getTrendingEvents, { limit: 50 })
  let events = result?.data ?? []

  if (!events.length) {
    const fallback = useQuery(api.discovery.getPublishedEvents, { limit: 50 })
    events = fallback?.data ?? []
  }

  return <EventGrid title="Trending" events={events} showPagination={events.length > 12} />
}

function CategoryEventsSection({ category }: { category: string }) {
  const result = useQuery(api.discovery.getEventsByCategory, { category, limit: 100 })
  const events = result?.data ?? []
  return <EventGrid title="Events" events={events} showPagination={events.length > 12} />
}

function CategorySectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </div>
  )
}

function EventGridSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    </div>
  )
}

function CategoryContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") ?? ""
  return <CategoryEventsSection category={category} />
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("foryou")
  const searchParams = useSearchParams()
  const category = searchParams.get("category")

  const showCategory = !!category

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
          <CategoryTabs />
        </Suspense>

        {showCategory ? (
          <Suspense fallback={<EventGridSkeleton />}>
            <CategoryContent />
          </Suspense>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="foryou">For You</TabsTrigger>
              <TabsTrigger value="all">All Events</TabsTrigger>
            </TabsList>

            <TabsContent value="foryou" className="space-y-6">
              <Suspense fallback={<EventGridSkeleton />}>
                <PersonalizedSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <Suspense fallback={<EventGridSkeleton />}>
                <AllEventsSection />
              </Suspense>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}