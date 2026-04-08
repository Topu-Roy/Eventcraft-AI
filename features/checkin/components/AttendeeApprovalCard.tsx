"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { AlertTriangle, CheckCircle2, Clock, Mail, User, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ScanState =
  | { type: "idle" }
  | {
      type: "pending"
      attendeeName: string
      attendeeEmail: string
      registeredAt: number
      ticketCode: string
      registrationId: Id<"registrations">
    }
  | { type: "already_approved"; attendeeName: string; approvedAt: number | null | undefined }
  | { type: "already_rejected" }
  | { type: "error"; message: string }

export function AttendeeApprovalCard({
  scanState,
  onApprove,
  onReject,
  onReset,
  isProcessing,
}: {
  scanState: ScanState
  onApprove: () => void
  onReject: () => void
  onReset: () => void
  isProcessing: boolean
}) {
  if (scanState.type === "idle") return null

  if (scanState.type === "pending") {
    return (
      <Card>
        <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-12">
              <User className="size-5 text-primary sm:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{scanState.attendeeName}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{scanState.attendeeEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>Registered: {new Date(scanState.registeredAt).toLocaleDateString()}</span>
          </div>

          <div className="text-xs break-all text-muted-foreground">Ticket: {scanState.ticketCode}</div>

          <div className="flex gap-2">
            <Button onClick={onApprove} disabled={isProcessing} className="min-h-11 flex-1">
              <CheckCircle2 className="mr-2 size-4" />
              Approve
            </Button>
            <Button variant="destructive" onClick={onReject} disabled={isProcessing} className="min-h-11 flex-1">
              <XCircle className="mr-2 size-4" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (scanState.type === "already_approved") {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <CheckCircle2 className="size-8 shrink-0 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Already approved</p>
            <p className="text-xs text-muted-foreground">
              {scanState.approvedAt
                ? `Approved at ${new Date(scanState.approvedAt).toLocaleTimeString()}`
                : "This ticket has already been checked in."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onReset} className="min-h-9 shrink-0">
            Scan Next
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (scanState.type === "already_rejected") {
    return (
      <Card className="border-red-500 bg-red-50 dark:bg-red-950">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <XCircle className="size-8 shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Already rejected</p>
            <p className="text-xs text-muted-foreground">This ticket was previously rejected.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onReset} className="min-h-9 shrink-0">
            Scan Next
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-500 bg-red-50 dark:bg-red-950">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
        <AlertTriangle className="size-8 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Invalid Ticket</p>
          <p className="text-xs text-muted-foreground">{scanState.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="min-h-9 shrink-0">
          Scan Next
        </Button>
      </CardContent>
    </Card>
  )
}
