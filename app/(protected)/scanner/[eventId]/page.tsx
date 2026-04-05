"use client"

import { useEffect, useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { useMutation } from "convex/react"
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Mail,
  QrCode,
  RotateCcw,
  Settings,
  User,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

type CameraPermissionState = "prompt" | "granted" | "denied" | "dismissed"

const AUTO_RESET_STORAGE_KEY = "scanner-auto-reset"
const CAMERA_PERMISSION_STORAGE_KEY = "scanner-camera-permission"

function getInitialAutoReset(): number {
  if (typeof window === "undefined") return 3000
  return localStorage.getItem(AUTO_RESET_STORAGE_KEY) === "fast" ? 1500 : 3000
}

function getInitialCameraPermission(): CameraPermissionState {
  if (typeof window === "undefined") return "prompt"
  const stored = localStorage.getItem(CAMERA_PERMISSION_STORAGE_KEY)
  return (stored as CameraPermissionState) ?? "prompt"
}

function AttendeeApprovalCard({
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
    const registeredDate = new Date(scanState.registeredAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    return (
      <Card className="border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <CardTitle className="text-lg">Ticket Scanned — Awaiting Approval</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border bg-accent p-4">
            <div className="flex items-center gap-2">
              <User className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">{scanState.attendeeName}</span>
            </div>
            {scanState.attendeeEmail ? (
              <div className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{scanState.attendeeEmail}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              <span>Registered: {registeredDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="size-4 shrink-0" />
              <span className="font-mono text-xs">{scanState.ticketCode}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={onApprove} disabled={isProcessing}>
              <CheckCircle2 className="mr-2 size-4" />
              Approve
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onReject} disabled={isProcessing}>
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
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="flex items-center gap-4 p-6">
          <AlertTriangle className="size-8 shrink-0 text-yellow-600" />
          <div className="flex-1">
            <p className="font-semibold">Already approved: {scanState.attendeeName}</p>
            <p className="text-xs text-muted-foreground">This ticket was already checked in.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            Scan Next
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (scanState.type === "already_rejected") {
    return (
      <Card className="border-red-500 bg-red-50 dark:bg-red-950">
        <CardContent className="flex items-center gap-4 p-6">
          <XCircle className="size-8 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Already rejected</p>
            <p className="text-xs text-muted-foreground">This ticket was previously rejected.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            Scan Next
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-500 bg-red-50 dark:bg-red-950">
      <CardContent className="flex items-center gap-4 p-6">
        <XCircle className="size-8 shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="font-semibold">Invalid Ticket</p>
          <p className="text-xs text-muted-foreground">{scanState.message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          Scan Next
        </Button>
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

export default function ScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
  const [eventId, setEventId] = useState<Id<"events"> | null>(null)
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera")
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>(getInitialCameraPermission)
  const [scanState, setScanState] = useState<ScanState>({ type: "idle" })
  const [manualCode, setManualCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoResetMs, setAutoResetMs] = useState(getInitialAutoReset)
  const [showSettings, setShowSettings] = useState(false)

  const lastScanRef = useRef<Map<string, number>>(new Map())
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const scanMutation = useMutation(api.checkin.scan)
  const approveMutation = useMutation(api.checkin.approve)
  const rejectMutation = useMutation(api.checkin.reject)

  useEffect(() => {
    void params.then(resolvedParams => setEventId(resolvedParams.eventId as Id<"events">))
  }, [params])

  useEffect(() => {
    lastScanRef.current.clear()
  }, [scanState.type])

  function handleReset() {
    setScanState({ type: "idle" })
  }

  async function handleScan(ticketCode: string, currentEventId: Id<"events">, currentAutoResetMs: number) {
    const currentTimestamp = Date.now()
    const lastScanTimestamp = lastScanRef.current.get(ticketCode)
    if (lastScanTimestamp && currentTimestamp - lastScanTimestamp < currentAutoResetMs) {
      return
    }
    lastScanRef.current.set(ticketCode, currentTimestamp)

    setIsProcessing(true)
    const result = await tryCatch(scanMutation({ ticketCode, eventId: currentEventId }))

    if (result.error) {
      setScanState({ type: "error", message: result.error.message })
      toast.error(result.error.message)
    } else if (result.data?.error) {
      if (result.data.cause === "Already approved") {
        setScanState({ type: "already_approved", attendeeName: "Attendee", approvedAt: null })
      } else if (result.data.cause === "Already rejected") {
        setScanState({ type: "already_rejected" })
      } else {
        setScanState({ type: "error", message: result.data.cause })
        toast.error(result.data.cause)
      }
    } else if (result.data?.data) {
      const d = result.data.data
      setScanState({
        type: "pending",
        attendeeName: d.attendeeName,
        attendeeEmail: d.attendeeEmail,
        registeredAt: d.registeredAt,
        ticketCode: d.ticketCode,
        registrationId: d.registrationId,
      })
    }

    setIsProcessing(false)
  }

  async function handleApprove() {
    if (scanState.type !== "pending") return
    setIsProcessing(true)

    const result = await tryCatch(approveMutation({ registrationId: scanState.registrationId }))

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success(`Approved: ${scanState.attendeeName}`)
      setTimeout(() => setScanState({ type: "idle" }), autoResetMs)
    }

    setIsProcessing(false)
  }

  async function handleReject() {
    if (scanState.type !== "pending") return
    setIsProcessing(true)

    const result = await tryCatch(rejectMutation({ registrationId: scanState.registrationId }))

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success(`Rejected: ${scanState.attendeeName}`)
      setScanState({ type: "idle" })
    }

    setIsProcessing(false)
  }

  function startScanning() {
    if (!videoRef.current) return

    void (async () => {
      try {
        const codeReader = new BrowserMultiFormatReader()
        codeReaderRef.current = codeReader

        void (await codeReader.decodeFromVideoElement(videoRef.current!, decodedResult => {
          if (decodedResult && eventId && scanState.type === "idle") {
            void handleScan(decodedResult.getText(), eventId, autoResetMs)
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
    })()
  }

  function stopScanning() {
    try {
      void codeReaderRef.current?.decodeFromVideoElement(undefined as unknown as HTMLVideoElement, () => {
        /* noop */
      })
    } catch {
      /* ignore */
    }
    codeReaderRef.current = null
    setIsScanning(false)
  }

  useEffect(() => {
    if (activeTab === "camera" && eventId && !isScanning && cameraPermission !== "denied") {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [activeTab, eventId, cameraPermission, isScanning, startScanning, stopScanning])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventId || !manualCode.trim()) return
    void handleScan(manualCode.trim(), eventId, autoResetMs)
    setManualCode("")
  }

  async function handleScan(ticketCode: string) {
    const currentEventId = eventIdRef.current
    if (!currentEventId) return

    const currentTimestamp = Date.now()
    const lastScanTimestamp = lastScanRef.current.get(ticketCode)
    if (lastScanTimestamp && currentTimestamp - lastScanTimestamp < autoResetRef.current) {
      return
    }
    lastScanRef.current.set(ticketCode, currentTimestamp)

    setIsProcessing(true)
    const result = await tryCatch(scanMutation({ ticketCode, eventId: currentEventId }))

    if (result.error) {
      setScanState({ type: "error", message: result.error.message })
      toast.error(result.error.message)
    } else if (result.data?.error) {
      if (result.data.cause === "Already approved") {
        setScanState({ type: "already_approved", attendeeName: "Attendee", approvedAt: null })
      } else if (result.data.cause === "Already rejected") {
        setScanState({ type: "already_rejected" })
      } else {
        setScanState({ type: "error", message: result.data.cause })
        toast.error(result.data.cause)
      }
    } else if (result.data?.data) {
      const d = result.data.data
      setScanState({
        type: "pending",
        attendeeName: d.attendeeName,
        attendeeEmail: d.attendeeEmail,
        registeredAt: d.registeredAt,
        ticketCode: d.ticketCode,
        registrationId: d.registrationId,
      })
    }

    setIsProcessing(false)
  }

  async function handleApprove() {
    if (scanState.type !== "pending") return
    setIsProcessing(true)

    const result = await tryCatch(approveMutation({ registrationId: scanState.registrationId }))

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success(`Approved: ${scanState.attendeeName}`)
      setTimeout(() => setScanState({ type: "idle" }), autoResetRef.current)
    }

    setIsProcessing(false)
  }

  async function handleReject() {
    if (scanState.type !== "pending") return
    setIsProcessing(true)

    const result = await tryCatch(rejectMutation({ registrationId: scanState.registrationId }))

    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success(`Rejected: ${scanState.attendeeName}`)
      setScanState({ type: "idle" })
    }

    setIsProcessing(false)
  }

  function startScanning() {
    if (!videoRef.current) return

    void (async () => {
      try {
        const codeReader = new BrowserMultiFormatReader()
        codeReaderRef.current = codeReader

        void (await codeReader.decodeFromVideoElement(videoRef.current!, decodedResult => {
          if (decodedResult && scanStateRef.current.type === "idle") {
            void handleScan(decodedResult.getText())
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
    })()
  }

  function stopScanning() {
    try {
      void codeReaderRef.current?.decodeFromVideoElement(undefined as unknown as HTMLVideoElement, () => {
        /* noop */
      })
    } catch {
      /* ignore */
    }
    codeReaderRef.current = null
    setIsScanning(false)
  }

  useEffect(() => {
    if (activeTab === "camera" && eventId && !isScanning && cameraPermission !== "denied") {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [activeTab, eventId, cameraPermission, isScanning])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventId || !manualCode.trim()) return
    void handleScan(manualCode.trim())
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
            <p className="mt-1 text-muted-foreground">Scan tickets and approve attendees.</p>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-reset timing</p>
                  <p className="text-xs text-muted-foreground">
                    {autoResetMs === 3000 ? "Standard (3s)" : "Fast (1.5s)"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleToggleAutoReset}>
                  <RotateCcw className="mr-1 size-3" />
                  Toggle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AttendeeApprovalCard
          scanState={scanState}
          onApprove={handleApprove}
          onReject={handleReject}
          onReset={handleReset}
          isProcessing={isProcessing}
        />

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
                  <Button type="submit" className="w-full" disabled={isProcessing || !manualCode.trim()}>
                    {isProcessing ? "Processing..." : "Scan Ticket"}
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
