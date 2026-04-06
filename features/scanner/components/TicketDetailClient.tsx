"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { ArrowLeft, Calendar, MapPin, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const ONE_HOUR_IN_MS = 60 * 60 * 1000

function QRSVG({ value }: { value: string }) {
  const [svgData, setSvgData] = useState<string>("")

  useEffect(() => {
    QRCode.toString(value, { type: "svg", width: 280, margin: 2 }, (_err, svg) => {
      if (svg) setSvgData(svg)
    })
  }, [value])

  if (!svgData) {
    return <div className="size-64 rounded-lg bg-muted" />
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
    void wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  useEffect(() => {
    let mounted = true
    const acquireWakeLock = async () => {
      if (!mounted || !("wakeLock" in navigator)) return
      try {
        const sentinel = await navigator.wakeLock.request("screen")
        if (mounted) wakeLockRef.current = sentinel
      } catch {
        // Wake lock not available
      }
    }

    void acquireWakeLock()

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && mounted) {
        void acquireWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      mounted = false
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      void releaseWakeLock()
    }
  }, [requestWakeLock, releaseWakeLock])

  return { releaseWakeLock }
}

type TicketDetailClientProps = {
  event: Doc<"events">
  registration: Doc<"registrations">
  badgeVariant: "default" | "destructive" | "secondary" | "outline"
  badgeText: string
  formattedDate: string
  formattedTime: string
}

export function TicketDetailClient({
  event,
  registration,
  badgeVariant,
  badgeText,
  formattedDate,
  formattedTime,
}: TicketDetailClientProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const cancelRegistration = useMutation(api.registrations.cancelRegistration)
  const router = useRouter()

  useScreenWakeLock()

  const oneHourBeforeStart = event.startDatetime - ONE_HOUR_IN_MS
  const now = new Date().getTime()
  const canCancel = registration && now < oneHourBeforeStart && registration.status === "active"

  async function handleCancel() {
    if (!registration) return
    setIsCancelling(true)
    const result = await tryCatch(() => cancelRegistration({ registrationId: registration._id }))
    if (result.error) {
      toast.error(result.error.message)
      setIsCancelling(false)
      return
    }
    const mutationResult = result.data
    if (mutationResult?.error) {
      toast.error(mutationResult.message ?? "Failed to cancel registration")
      setIsCancelling(false)
      return
    }
    toast.success("Registration cancelled")
    router.push("/tickets")
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-md space-y-6">
        <button
          type="button"
          aria-label="Go back to tickets"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <Card className="overflow-hidden">
          <div
            className="aspect-video w-full"
            style={{ backgroundColor: event.themeColor ?? "hsl(var(--muted))" }}
          />
          <CardContent className="space-y-6 p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-bold">{event.title}</h1>
              <Badge variant={badgeVariant}>{badgeText}</Badge>
            </div>

            <div className="mx-auto inline-block rounded-lg bg-card p-4">
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
