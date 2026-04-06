import type { Doc } from "@/convex/_generated/dataModel"
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react"
import Link from "next/link"
import { CoverImage } from "@/components/CoverImage"
import { Badge } from "@/components/ui/badge"

type EventCardProps = {
  event: Doc<"events">
  variant?: "default" | "compact" | "list"
  now?: number
  isRegistered?: boolean
}

const categoryColors: Record<string, string> = {
  technology: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  music: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "art-design": "bg-pink-500/10 text-pink-500 border-pink-500/20",
  sports: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "food-drink": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  business: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  "health-wellness": "bg-green-500/10 text-green-500 border-green-500/20",
  education: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "social-community": "bg-teal-500/10 text-teal-500 border-teal-500/20",
  gaming: "bg-violet-500/10 text-violet-500 border-violet-500/20",
}

function getCategoryBadge(category: string) {
  const colorClass = categoryColors[category] ?? "bg-muted text-muted-foreground border-border"
  const label = category
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <Badge variant="outline" className={`border ${colorClass} font-medium`}>
      {label}
    </Badge>
  )
}

function formatEventDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatEventTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatCapacity(capacity: number | undefined, count: number): string {
  if (capacity === undefined) return `${count} registered`
  const remaining = capacity - count
  if (remaining <= 0) return "Sold out"
  if (remaining <= 5) return `${remaining} spots left`
  return `${count}/${capacity}`
}

export function EventCard({ event, variant = "default", now, isRegistered }: EventCardProps) {
  const isPast = event.startDatetime < (now ?? 0)
  const isFull = event.capacity !== undefined && event.registrationCount >= event.capacity

  if (variant === "compact") {
    return (
      <Link
        href={`/events/${event._id}`}
        className="group relative flex w-64 shrink-0 flex-col overflow-hidden border bg-card transition-all hover:border-primary/50 hover:shadow-sm"
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <CoverImage
            storageId={event.coverPhoto}
            themeColor={event.themeColor}
            alt={event.title}
            className="h-full w-full transition-transform group-hover:scale-105"
          />
          {isPast && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <span className="text-xs font-medium text-muted-foreground">Ended</span>
            </div>
          )}
          {isRegistered && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="gap-1 text-[10px]">
                <Ticket className="size-3" />
                Registered
              </Badge>
            </div>
          )}
        </div>
        <div className="space-y-1.5 p-3">
          <h3 className="truncate text-sm leading-tight font-semibold">{event.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3 shrink-0" />
            <span>{formatEventDate(event.startDatetime)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{event.venue.city}</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "list") {
    return (
      <Link
        href={`/events/${event._id}`}
        className="group relative flex gap-4 overflow-hidden border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
      >
        {isRegistered && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="gap-1 text-[10px]">
              <Ticket className="size-3" />
              Registered
            </Badge>
          </div>
        )}
        <div className="relative aspect-square h-24 shrink-0 overflow-hidden bg-muted">
          <CoverImage
            storageId={event.coverPhoto}
            themeColor={event.themeColor}
            alt={event.title}
            className="h-full w-full transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-semibold">{event.title}</h3>
              {getCategoryBadge(event.category)}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {formatEventDate(event.startDatetime)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {event.venue.city}, {event.venue.country}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {formatCapacity(event.capacity, event.registrationCount)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/events/${event._id}`}
      className="group relative flex w-72 shrink-0 flex-col overflow-hidden border bg-card transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <CoverImage
          storageId={event.coverPhoto}
          themeColor={event.themeColor}
          alt={event.title}
          className="h-full w-full"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">{getCategoryBadge(event.category)}</div>
        {isPast && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="text-xs font-medium text-muted-foreground">Ended</span>
          </div>
        )}
        {isFull && !isPast && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            Full
          </Badge>
        )}
        {isRegistered && (
          <Badge className="absolute top-2 right-2" variant="default">
            <Ticket className="mr-1 size-3" />
            Registered
          </Badge>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm leading-tight font-semibold">{event.title}</h3>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>
              {formatEventDate(event.startDatetime)} · {formatEventTime(event.startDatetime)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5 shrink-0" />
            <span>{formatCapacity(event.capacity, event.registrationCount)}</span>
          </div>
        </div>
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {event.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{event.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
