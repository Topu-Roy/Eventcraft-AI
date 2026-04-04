"use client"

import type { Session } from "better-auth"
import { Monitor, Shield, Smartphone, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UAParser } from "ua-parser-js"
import { useRevokeOtherSessionsMutation, useRevokeSessionMutation } from "@/features/auth/hooks/mutations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export function SessionManagement({
  sessions,
  currentSessionToken,
}: {
  sessions: Session[]
  currentSessionToken: string
}) {
  const router = useRouter()
  const revokeSessions = useRevokeOtherSessionsMutation()

  const otherSessions = sessions
    .filter(s => s.token !== currentSessionToken)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const currentSession = sessions.find(s => s.token === currentSessionToken)

  function handleRevokeOtherSessions() {
    revokeSessions.mutate(undefined, {
      onSuccess: () => {
        router.refresh()
        toast.success("Other sessions have been terminated")
      },
      onError: err => {
        toast.error(err.message ?? "Failed to terminate other sessions")
      },
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Current Session Section */}
      {currentSession && (
        <section>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Current Session</h2>
              <Button variant="destructive" size="sm" onClick={handleRevokeOtherSessions}>
                <Trash2 />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">This is the device you&apos;re currently using</p>
          </div>
          <SessionCard session={currentSession} isCurrentSession />
        </section>
      )}

      {/* Other Sessions Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Other Sessions</h2>
            <p className="text-sm text-muted-foreground">
              {otherSessions.length > 0
                ? `${otherSessions.length} other ${otherSessions.length === 1 ? "session" : "sessions"} active`
                : "No other active sessions"}
            </p>
          </div>
          {otherSessions.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleRevokeOtherSessions}>
              {revokeSessions.isPending ? (
                <Spinner />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Terminate All
                </>
              )}
            </Button>
          )}
        </div>

        {otherSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Shield className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">No other active sessions</p>
            <p className="text-sm text-muted-foreground">You&apos;re only signed in on this device</p>
          </div>
        ) : (
          <div className="space-y-3">
            {otherSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SessionCard({ session, isCurrentSession = false }: { session: Session; isCurrentSession?: boolean }) {
  const router = useRouter()
  const revokeSessionMutation = useRevokeSessionMutation()

  const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null

  function getBrowserInformation() {
    if (userAgentInfo == null) return "Unknown Device"
    if (userAgentInfo.browser.name == null && userAgentInfo.os.name == null) {
      return "Unknown Device"
    }

    if (userAgentInfo.browser.name == null) return userAgentInfo.os.name
    if (userAgentInfo.os.name == null) return userAgentInfo.browser.name

    return `${userAgentInfo.browser.name} on ${userAgentInfo.os.name}`
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  }

  function handleRevokeSession() {
    revokeSessionMutation.mutate(
      { token: session.token },
      {
        onSuccess: () => {
          router.refresh()
          toast.success("Session terminated successfully")
        },
        onError: err => {
          toast.error(err.message ?? "Failed to terminate session")
        },
      }
    )
  }

  const DeviceIcon = userAgentInfo?.device.type === "mobile" ? Smartphone : Monitor

  return (
    <div className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            <DeviceIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{getBrowserInformation()}</h3>
              {isCurrentSession && (
                <Badge variant="secondary" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Created: {formatDate(session.createdAt)}</p>
              <p>Expires: {formatDate(session.expiresAt)}</p>
            </div>
          </div>
        </div>
        {!isCurrentSession && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRevokeSession}
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {revokeSessionMutation.isPending ? (
              <Spinner />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Revoke session</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export function SessionManagementSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      </div>

      {/* Page Content */}
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Current Session Section */}
        <section>
          <div className="mb-4 space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-24 w-full" />
        </section>

        <Skeleton className="h-px w-full" />

        {/* Other Sessions Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          {/* 3 skeleton cards */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-3 border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
