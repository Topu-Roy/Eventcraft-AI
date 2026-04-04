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

type ScanResultStatus = "success" | "already_checked_in" | "invalid"

type ScanResultData = {
  status: ScanResultStatus
  message: string
  attendeeName?: string
  timestamp: Date
}

type CameraPermissionState = "prompt" | "granted" | "denied" | "dismissed"

const AUTO_RESET_STORAGE_KEY = "scanner-auto-reset"
const CAMERA_PERMISSION_STORAGE_KEY = "scanner-camera-permission"

function ScannerResultBanner({ scanResult }: { scanResult: ScanResultData }) {
  const statusColors: Record<ScanResultStatus, string> = {
    success: "border-green-500 bg-green-50 dark:bg-green-950",
    already_checked_in: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
    invalid: "border-red-500 bg-red-50 dark:bg-red-950",
  }

  const statusIcons: Record<ScanResultStatus, React.ReactNode> = {
    success: <CheckCircle2 className="size-8 shrink-0 text-green-600" />,
    already_checked_in: <AlertTriangle className="size-8 shrink-0 text-yellow-600" />,
    invalid: <XCircle className="size-8 shrink-0 text-red-600" />,
  }

  return (
    <Card className={statusColors[scanResult.status]}>
      <CardContent className="flex items-center gap-4 p-6">
        {statusIcons[scanResult.status]}
        <div>
          <p className="font-semibold">{scanResult.message}</p>
          <p className="text-xs text-muted-foreground">{scanResult.timestamp.toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ScannerSettingsPanel({
  autoResetMs,
  onToggleAutoReset,
}: {
  autoResetMs: number
  onToggleAutoReset: () => void
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-reset timing</p>
            <p className="text-xs text-muted-foreground">
              {autoResetMs === 3000 ? "Standard (3s)" : "Fast (1.5s)"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onToggleAutoReset}>
            <RotateCcw className="mr-1 size-3" />
            Toggle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ScannerCameraView({
  videoRef,
  cameraPermission,
  isScanning,
  onStartCamera,
  onRetryPermission,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  cameraPermission: CameraPermissionState
  isScanning: boolean
  onStartCamera: () => void
  onRetryPermission: () => void
}) {
  if (cameraPermission === "denied") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CameraOff className="size-12 text-muted-foreground" />
        <div>
          <p className="font-medium">Camera access denied</p>
          <p className="text-sm text-muted-foreground">Please enable camera access in your browser settings.</p>
        </div>
        <Button variant="outline" onClick={onRetryPermission}>
          Try Again
        </Button>
      </div>
    )
  }

  if (cameraPermission === "dismissed") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Camera className="size-12 text-muted-foreground" />
        <div>
          <p className="font-medium">No camera found</p>
          <p className="text-sm text-muted-foreground">Connect a camera or use manual code entry.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <video ref={videoRef} className="absolute inset-0 size-full object-cover" muted playsInline />
      {!isScanning ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button onClick={onStartCamera}>
            <Camera className="mr-2 size-4" />
            Start Camera
          </Button>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 m-8 rounded-lg border-2 border-primary/50" />
    </div>
  )
}

function ScannerManualEntryForm({
  manualCode,
  isSubmitting,
  onCodeChange,
  onSubmit,
}: {
  manualCode: string
  isSubmitting: boolean
  onCodeChange: (code: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Ticket Code</CardTitle>
        <CardDescription>Type or paste the ticket code manually.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="manual-code">Ticket Code</Label>
            <Input
              id="manual-code"
              placeholder="e.g., abc123xyz"
              value={manualCode}
              onChange={e => onCodeChange(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !manualCode.trim()}>
            {isSubmitting ? "Processing..." : "Check In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
  const [eventId, setEventId] = useState<Id<"events"> | null>(null)
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera")
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>("prompt")
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoResetMs, setAutoResetMs] = useState(3000)
  const [showSettings, setShowSettings] = useState(false)

  const lastScanRef = useRef<Map<string, number>>(new Map())
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const checkInMutation = useMutation(api.checkin.checkIn)

  useEffect(() => {
    void params.then(resolvedParams => setEventId(resolvedParams.eventId as Id<"events">))
  }, [params])

  useEffect(() => {
    const storedReset = localStorage.getItem(AUTO_RESET_STORAGE_KEY)
    if (storedReset === "fast") {
      setAutoResetMs(1500)
    }
  }, [])

  useEffect(() => {
    const storedPermission = localStorage.getItem(CAMERA_PERMISSION_STORAGE_KEY)
    if (storedPermission) {
      setCameraPermission(storedPermission as CameraPermissionState)
    }
  }, [])

  const handleProcessCheckInResult = useCallback(
    (result: { status: ScanResultStatus; attendeeName?: string; reason?: string }) => {
      const scanResultData: ScanResultData = {
        status: result.status,
        message:
          result.status === "success"
            ? `Checked in: ${result.attendeeName}`
            : result.status === "already_checked_in"
              ? "Already checked in"
              : (result.reason ?? "Unknown error"),
        attendeeName: result.status !== "invalid" ? result.attendeeName : undefined,
        timestamp: new Date(),
      }

      setScanResult(scanResultData)

      if (result.status === "success") {
        toast.success(`Checked in: ${result.attendeeName}`)
      } else if (result.status === "already_checked_in") {
        toast.warning("Already checked in")
      } else {
        toast.error(result.reason ?? "Check-in failed")
      }

      setTimeout(() => setScanResult(null), autoResetMs)
    },
    [autoResetMs]
  )

  const handleScanResult = useCallback(
    async (ticketCode: string) => {
      if (!eventId) return

      const currentTimestamp = Date.now()
      const lastScanTimestamp = lastScanRef.current.get(ticketCode)
      if (lastScanTimestamp && currentTimestamp - lastScanTimestamp < autoResetMs) {
        return
      }
      lastScanRef.current.set(ticketCode, currentTimestamp)

      setIsSubmitting(true)
      try {
        const result = await checkInMutation({ ticketCode, eventId })
        handleProcessCheckInResult(result)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Check-in failed")
      } finally {
        setIsSubmitting(false)
      }
    },
    [eventId, checkInMutation, autoResetMs, handleProcessCheckInResult]
  )

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return

    try {
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      void (await codeReader.decodeFromVideoElement(videoRef.current, decodedResult => {
        if (decodedResult && !isSubmitting) {
          void handleScanResult(decodedResult.getText())
        }
      }))

      setCameraPermission("granted")
      localStorage.setItem(CAMERA_PERMISSION_STORAGE_KEY, "granted")
      setIsScanning(true)
    } catch (error) {
      const scanError = error as Error
      if (scanError.name === "NotAllowedError") {
        setCameraPermission("denied")
        localStorage.setItem(CAMERA_PERMISSION_STORAGE_KEY, "denied")
      } else if (scanError.name === "NotFoundError") {
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

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventId || !manualCode.trim()) return
    void handleScanResult(manualCode.trim())
    setManualCode("")
  }

  function handleToggleAutoReset() {
    const newResetMs = autoResetMs === 3000 ? 1500 : 3000
    setAutoResetMs(newResetMs)
    localStorage.setItem(AUTO_RESET_STORAGE_KEY, newResetMs === 1500 ? "fast" : "standard")
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Toggle settings"
          >
            <Settings className="size-4" />
          </Button>
        </div>

        {showSettings ? (
          <ScannerSettingsPanel autoResetMs={autoResetMs} onToggleAutoReset={handleToggleAutoReset} />
        ) : null}

        {scanResult ? <ScannerResultBanner scanResult={scanResult} /> : null}

        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as "camera" | "manual")}>
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
                <ScannerCameraView
                  videoRef={videoRef}
                  cameraPermission={cameraPermission}
                  isScanning={isScanning}
                  onStartCamera={startScanning}
                  onRetryPermission={() => setCameraPermission("prompt")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <ScannerManualEntryForm
              manualCode={manualCode}
              isSubmitting={isSubmitting}
              onCodeChange={setManualCode}
              onSubmit={handleManualSubmit}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
