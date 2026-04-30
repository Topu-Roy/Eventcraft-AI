"use client"

import { useState } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import { EventCard } from "@/features/events/components/EventCard"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

const ITEMS_PER_PAGE = 12

interface EventGridProps {
  title: string
  events: Doc<"events">[]
  emptyMessage?: string
  showPagination?: boolean
}

export function EventGrid({ title, events, emptyMessage = "No events found", showPagination = true }: EventGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedEvents = events.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (!events.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedEvents.map(event => (
          <EventCard key={event._id} event={event} variant="compact" />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1) }} disabled={currentPage === 1} />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1
              if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                if (page === 2 || page === totalPages - 1) return <PaginationEllipsis key={page} />
                return null
              }
              return (
                <PaginationItem key={page}>
                  <PaginationLink href="#" isActive={currentPage === page} onClick={(e) => { e.preventDefault(); handlePageChange(page) }}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1) }} disabled={currentPage === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export function EventGridSkeleton() {
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