import { Suspense } from "react"
import { MyTicketsContent } from "@/features/tickets/components/MyTicketsContent"
import type { Metadata } from "next"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "My Tickets — EventCraft AI",
  description: "Your event tickets. QR-coded. Always in your pocket.",
}

function TicketListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<TicketListSkeleton />}>
      <MyTicketsContent />
    </Suspense>
  )
}
