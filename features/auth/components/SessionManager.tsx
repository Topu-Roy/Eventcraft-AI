"use client"

import { useListAllSessionsQuery, useListCurrentSessionQuery } from "@/features/auth/hooks/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { SessionManagement } from "./sessionManagement"

export function SessionManager() {
  const { data: sessions, isPending } = useListAllSessionsQuery()
  const { data: currentSession } = useListCurrentSessionQuery()

  if (sessions?.error) {
    return <p>Error fetching sessions</p>
  }

  if (!sessions || isPending) {
    return <Spinner />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Active Sessions</CardTitle>
        <CardDescription>Manage your active devices and sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isPending ? (
            <p>Loading sessions...</p>
          ) : sessions?.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <SessionManagement
              currentSessionToken={currentSession?.data?.session.token ?? ""}
              sessions={sessions.data}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
