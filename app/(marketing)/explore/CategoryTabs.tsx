"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCarousel, EventCarouselSkeleton } from "./EventCarousel"

export function CategoryTabs({ categories }: { categories: Doc<"categories">[] }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug || "")

  const events = useQuery(
    api.discovery.getEventsByCategory,
    activeCategory ? { category: activeCategory, limit: 10 } : "skip"
  )

  if (!categories.length) return null

  return (
    <div className="space-y-4">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full flex-nowrap justify-start overflow-x-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat._id} value={cat.slug} className="shrink-0">
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat._id} value={cat.slug}>
            {events === undefined ? (
              <EventCarouselSkeleton title={cat.name} />
            ) : (
              <EventCarousel
                title={cat.name}
                events={events || []}
                emptyMessage={`No events in ${cat.name} yet`}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
