"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { Ban, Settings2, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type RegistrationCTAProps = {
  eventId: Id<"events">
  isOrganizer: boolean
  isRegistered: boolean
  isFull: boolean
  isPast: boolean
  isCancelled: boolean
}

export function RegistrationCTA({
  eventId,
  isOrganizer,
  isRegistered,
  isFull,
  isPast,
  isCancelled,
}: RegistrationCTAProps) {
  const register = useMutation(api.registrations.register)
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)

  if (isCancelled) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Ban className="mr-2 size-4" />
        Event Cancelled
      </Button>
    )
  }

  if (isPast) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Event Ended
      </Button>
    )
  }

  if (isOrganizer) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(`/organizer/events/${eventId}/edit`)}
      >
        <Settings2 className="mr-2 size-4" />
        Manage Event
      </Button>
    )
  }

  if (isRegistered) {
    return (
      <Button className="w-full" onClick={() => router.push(`/tickets`)}>
        <Ticket className="mr-2 size-4" />
        View My Ticket
      </Button>
    )
  }

  if (isFull) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Event Full
      </Button>
    )
  }

  async function handleRegister() {
    setIsRegistering(true)
    try {
      const result = await register({ eventId })
      toast.success("You're registered!")
      router.push(`/tickets/${result.ticketCode}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleRegister} disabled={isRegistering}>
      <Ticket className="mr-2 size-4" />
      {isRegistering ? "Registering..." : "Register"}
    </Button>
  )
}
