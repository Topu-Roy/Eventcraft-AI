"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import { ArrowLeft, Calendar, MapPin, Ticket, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function QRSVG({ value }: { value: string }) {
  const [svgData, setSvgData] = useState<string>("")

  useEffect(() => {
    QRCode.toString(value, { type: "svg", width: 280, margin: 2 }, (_err, svg) => {
      if (svg) setSvgData(svg)
    })
  }, [value])

  if (!svgData) {
    return <Skeleton className="size-64 rounded-lg" />
  }

  return <div className="mx-auto" dangerouslySetInnerHTML={{ __html: svgData }} />
}

function useScreenWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if ("wakeLock" in navigator) {
      try {
        const sentinel = await navigator.wakeLock.request("screen")
        wakeLockRef.current = sentinel
      } catch {
        // Wake lock not available
      }
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  useEffect(() => {
    requestWakeLock()

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      releaseWakeLock()
    }
  }, [requestWakeLock, releaseWakeLock])

  return { releaseWakeLock }
}

export default function TicketDetailPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const [ticketCode, setTicketCode] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    params.then(p => setTicketCode(p.ticketCode))
  }, [params])

  const registrationData = useQuery(api.registrations.getByTicketCode, ticketCode ? { ticketCode } : "skip")
  const cancelRegistration = useMutation(api.registrations.cancelRegistration)
  const router = useRouter()

  useScreenWakeLock()

  const registration = registrationData?.registration
  const event = registrationData?.event

  if (registrationData === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!registration || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <Ticket className="mx-auto size-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Ticket not found</h1>
          <p className="text-muted-foreground">This ticket does not exist or has been removed.</p>
          <Button onClick={() => router.push("/tickets")}>Back to Tickets</Button>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.startDatetime)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const oneHourBeforeStart = event.startDatetime - 60 * 60 * 1000
  const canCancel = registration && Date.now() < oneHourBeforeStart && registration.status === "active"

  async function handleCancel() {
    if (!registration) return
    setIsCancelling(true)
    try {
      await cancelRegistration({ registrationId: registration._id })
      toast.success("Registration cancelled")
      router.push("/tickets")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel registration")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-md space-y-6">
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <Card className="overflow-hidden">
          <div
            className="aspect-video w-full"
            style={{ backgroundColor: event.coverPhoto?.dominantColor ?? "#3B82F6" }}
          />
          <CardContent className="space-y-6 p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-bold">{event.title}</h1>
              <Badge variant={registration.checkedIn ? "default" : "secondary"}>
                {registration.checkedIn ? "Checked In" : "Active"}
              </Badge>
            </div>

            <div className="mx-auto inline-block rounded-lg bg-white p-4">
              <QRSVG value={registration.ticketCode} />
            </div>

            <p className="text-center font-mono text-xs text-muted-foreground">{registration.ticketCode}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 shrink-0 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 shrink-0 text-muted-foreground" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <span>{event.venue.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span>
                  {event.venue.city}, {event.venue.country}
                </span>
              </div>
            </div>

            {canCancel && (
              <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={isCancelling}>
                <XCircle className="mr-2 size-4" />
                {isCancelling ? "Cancelling..." : "Cancel Registration"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
