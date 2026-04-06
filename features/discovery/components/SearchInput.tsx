"use client"

import { useEffect, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function SearchResultItem({ event }: { event: Doc<"events"> }) {
  const router = useRouter()

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
      onClick={() => router.push(`/events/${event._id}`)}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{event.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {event.venue.city}, {event.venue.country}
        </p>
      </div>
    </button>
  )
}

export function SearchInput() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const results = useQuery(
    api.discovery.searchEvents,
    debouncedQuery.trim().length >= 2 ? { query: debouncedQuery, limit: 8 } : "skip"
  )

  const events = results?.data ?? []
  const hasResults = events.length > 0

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-10"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200)
          }}
        />
      </div>

      {isOpen && debouncedQuery.trim().length >= 2 && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-2 shadow-lg">
          <CardContent className="p-2">
            {hasResults ? (
              <div className="space-y-1">
                {events.map(event => (
                  <SearchResultItem key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No events found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
