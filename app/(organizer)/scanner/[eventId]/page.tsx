"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { useMutation } from "convex/react"
import { AlertTriangle, Camera, CameraOff, CheckCircle2, QrCode, RotateCcw, Settings, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ScanResult = {
  status: "success" | "already_checked_in" | "invalid"
  message: string
  attendeeName?: string
  timestamp: Date
}

type CameraPermissionState = "prompt" | "granted" | "denied" | "dismissed"

const STORAGE_KEY_RESET = "scanner-auto-reset"
const STORAGE_KEY_PERMISSION = "scanner-camera-permission"

export default function ScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
  const [eventId, setEventId] = useState<Id<"events"> | null>(null)
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera")
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>("prompt")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoResetMs, setAutoResetMs] = useState(3000)
  const [showSettings, setShowSettings] = useState(false)

  const lastScanRef = useRef<Map<string, number>>(new Map())
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const checkIn = useMutation(api.checkin.checkIn)

  useEffect(() => {
    void params.then(p => setEventId(p.eventId as Id<"events">))
  }, [params])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_RESET)
    if (stored === "fast") {
      setAutoResetMs(1500)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PERMISSION)
    if (stored) {
      setCameraPermission(stored as CameraPermissionState)
    }
  }, [])

  const handleScanResult = useCallback(
    async (code: string) => {
      if (!eventId) return

      const now = Date.now()
      const lastScan = lastScanRef.current.get(code)
      if (lastScan && now - lastScan < autoResetMs) {
        return
      }
      lastScanRef.current.set(code, now)

      setIsSubmitting(true)
      try {
        const result = await checkIn({ ticketCode: code, eventId })

        const scanResult: ScanResult = {
          status: result.status,
          message:
            result.status === "success"
              ? `Checked in: ${result.attendeeName}`
              : result.status === "already_checked_in"
                ? "Already checked in"
                : result.reason,
          attendeeName: result.status !== "invalid" ? result.attendeeName : undefined,
          timestamp: new Date(),
        }

        setScanResult(scanResult)

        if (result.status === "success") {
          toast.success(`Checked in: ${result.attendeeName}`)
        } else if (result.status === "already_checked_in") {
          toast.warning("Already checked in")
        } else {
          toast.error(result.reason)
        }

        setTimeout(() => setScanResult(null), autoResetMs)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Check-in failed")
      } finally {
        setIsSubmitting(false)
      }
    },
    [eventId, checkIn, autoResetMs]
  )

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return

    try {
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      void (await codeReader.decodeFromVideoElement(videoRef.current, result => {
        if (result && !isSubmitting) {
          void handleScanResult(result.getText())
        }
      }))

      setCameraPermission("granted")
      localStorage.setItem(STORAGE_KEY_PERMISSION, "granted")
      setIsScanning(true)
    } catch (error) {
      const err = error as Error
      if (err.name === "NotAllowedError") {
        setCameraPermission("denied")
        localStorage.setItem(STORAGE_KEY_PERMISSION, "denied")
      } else if (err.name === "NotFoundError") {
        setCameraPermission("dismissed")
      }
    }
  }, [handleScanResult, isSubmitting])

  const stopScanning = useCallback(() => {
    try {
      void codeReaderRef.current?.decodeFromVideoElement(undefined as unknown as HTMLVideoElement, () => {
        /* noop */
      })
    } catch {
      /* ignore */
    }
    codeReaderRef.current = null
    setIsScanning(false)
  }, [])

  useEffect(() => {
    if (activeTab === "camera" && eventId && !isScanning && cameraPermission !== "denied") {
      void startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [activeTab, eventId, cameraPermission, isScanning, startScanning, stopScanning])

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventId || !manualCode.trim()) return
    await handleScanResult(manualCode.trim())
    setManualCode("")
  }

  function toggleAutoReset() {
    const newMs = autoResetMs === 3000 ? 1500 : 3000
    setAutoResetMs(newMs)
    localStorage.setItem(STORAGE_KEY_RESET, newMs === 1500 ? "fast" : "standard")
  }

  if (!eventId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
            <p className="mt-1 text-muted-foreground">Scan tickets to check in attendees.</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="size-4" />
          </Button>
        </div>

        {showSettings && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-reset timing</p>
                  <p className="text-xs text-muted-foreground">
                    {autoResetMs === 3000 ? "Standard (3s)" : "Fast (1.5s)"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={toggleAutoReset}>
                  <RotateCcw className="mr-1 size-3" />
                  Toggle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {scanResult && (
          <Card
            className={
              scanResult.status === "success"
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : scanResult.status === "already_checked_in"
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                  : "border-red-500 bg-red-50 dark:bg-red-950"
            }
          >
            <CardContent className="flex items-center gap-4 p-6">
              {scanResult.status === "success" && <CheckCircle2 className="size-8 shrink-0 text-green-600" />}
              {scanResult.status === "already_checked_in" && (
                <AlertTriangle className="size-8 shrink-0 text-yellow-600" />
              )}
              {scanResult.status === "invalid" && <XCircle className="size-8 shrink-0 text-red-600" />}
              <div>
                <p className="font-semibold">{scanResult.message}</p>
                <p className="text-xs text-muted-foreground">{scanResult.timestamp.toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "camera" | "manual")}>
          <TabsList className="w-full">
            <TabsTrigger value="camera" className="flex-1">
              <Camera className="mr-1 size-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">
              <QrCode className="mr-1 size-4" />
              Manual Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera">
            <Card>
              <CardContent className="p-4">
                {cameraPermission === "denied" ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <CameraOff className="size-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Camera access denied</p>
                      <p className="text-sm text-muted-foreground">
                        Please enable camera access in your browser settings.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setCameraPermission("prompt")}>
                      Try Again
                    </Button>
                  </div>
                ) : cameraPermission === "dismissed" ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <Camera className="size-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">No camera found</p>
                      <p className="text-sm text-muted-foreground">Connect a camera or use manual code entry.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                    <video ref={videoRef} className="absolute inset-0 size-full object-cover" muted playsInline />
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button onClick={startScanning}>
                          <Camera className="mr-2 size-4" />
                          Start Camera
                        </Button>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 m-8 rounded-lg border-2 border-primary/50" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Enter Ticket Code</CardTitle>
                <CardDescription>Type or paste the ticket code manually.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="manual-code">Ticket Code</Label>
                    <Input
                      id="manual-code"
                      placeholder="e.g., abc123xyz"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !manualCode.trim()}>
                    {isSubmitting ? "Processing..." : "Check In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
