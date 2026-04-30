"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AlertTriangle, Database, RefreshCw, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClearSeedData, useIsAdmin, useSeedCategories, useSeedEvents,  useSeedStatus } from "../hooks/useSeedData"

export function SeedPanel() {
  const status = useSeedStatus()
  const isAdmin = useIsAdmin()
  const seedCategories = useSeedCategories()
  const seedEvents = useSeedEvents()
  const clearSeedData = useClearSeedData()
  const [isSeedingCategories, setIsSeedingCategories] = useState(false)
  const [isSeedingEvents, setIsSeedingEvents] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleSeedCategories = async () => {
    setIsSeedingCategories(true)
    try {
      const result = await seedCategories()
      if (result?.error) {
        toast.error(result.cause || "Failed")
      } else {
        toast.success(result?.data?.message ?? "Done")
      }
    } catch {
      toast.error("Error seeding categories")
    } finally {
      setIsSeedingCategories(false)
    }
  }

  const handleSeedEvents = async () => {
    setIsSeedingEvents(true)
    try {
      const result = await seedEvents()
      if (result?.error) {
        toast.error(result.cause || "Failed")
      } else {
        toast.success(result?.data?.message ?? "Done")
      }
    } catch {
      toast.error("Error seeding events")
    } finally {
      setIsSeedingEvents(false)
    }
  }


  const handleClearSeedData = async () => {
    setIsClearing(true)
    try {
      const result = await clearSeedData()
      if (result?.error) {
        toast.error(result.cause || "Failed")
      } else {
        toast.success("Seed data cleared")
      }
    } catch {
      toast.error("Error clearing seed data")
    } finally {
      setIsClearing(false)
    }
  }

  if (status === undefined || isAdmin === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seed Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Seed Data Management</CardTitle>
        {status?.hasSeedData && (
          <Badge variant="default" className="ml-2">
            <Database className="mr-1 h-3 w-3" />
            Seeded
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            <p>Events: {status?.eventsSeeded ?? 0}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleSeedCategories} disabled={isSeedingCategories} variant="outline" size="sm">
            {isSeedingCategories ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
            Seed Categories
          </Button>

          <Button onClick={handleSeedEvents} disabled={isSeedingEvents} variant="outline" size="sm">
            {isSeedingEvents ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
            Seed Events
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!status?.hasSeedData || isClearing} variant="destructive" size="sm">
                {isClearing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear All Seed Data?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all seed data. This action cannot be undone.
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearSeedData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}