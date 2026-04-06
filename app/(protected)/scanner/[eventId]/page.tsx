"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AttendeeApprovalCard } from "@/features/checkin/components/AttendeeApprovalCard"
import { ScannerCameraView } from "@/features/checkin/components/ScannerCameraView"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { useMutation } from "convex/react"
import { QrCode, Settings } from "lucide-react"
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
  const autoResetMsRef = useRef(autoResetMs)

  const scanMutation = useMutation(api.checkin.scan)
  const approveMutation = useMutation(api.checkin.approve)
  const rejectMutation = useMutation(api.checkin.reject)

  useEffect(() => {
    autoResetMsRef.current = autoResetMs
  }, [autoResetMs])

  useEffect(() => {
    void params.then(resolvedParams => setEventId(resolvedParams.eventId as Id<"events">))
  }, [params])

  function handleReset() {
    setScanState({ type: "idle" })
  }

  const handleScan = useCallback(
    async (ticketCode: string) => {
      if (!eventId) return

      const currentTimestamp = Date.now()
      const lastScanTimestamp = lastScanRef.current.get(ticketCode)
      if (lastScanTimestamp && currentTimestamp - lastScanTimestamp < autoResetMsRef.current) {
        return
      }
      lastScanRef.current.set(ticketCode, currentTimestamp)

      setIsProcessing(true)
      const result = await tryCatch(scanMutation({ ticketCode, eventId }))

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
    },
    [eventId, scanMutation]
  )

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
      toast.success("Registration rejected")
      setTimeout(() => setScanState({ type: "idle" }), autoResetMs)
    }

    setIsProcessing(false)
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!manualCode.trim()) return
    void handleScan(manualCode.trim())
    setManualCode("")
  }

  const handleStartCamera = useCallback(() => {
    setActiveTab("camera")
  }, [])

  const handleRetryPermission = useCallback(() => {
    setCameraPermission("prompt")
    localStorage.removeItem(CAMERA_PERMISSION_STORAGE_KEY)
  }, [])

  // Camera scanning logic
  useEffect(() => {
    if (activeTab !== "camera" || !eventId || isScanning || cameraPermission === "denied") return

    let cancelled = false
    let codeReader: BrowserMultiFormatReader | null = null

    async function start() {
      if (!videoRef.current) return
      try {
        codeReader = new BrowserMultiFormatReader()
        codeReaderRef.current = codeReader

        void (await codeReader.decodeFromVideoElement(videoRef.current, decodedResult => {
          if (decodedResult && scanState.type === "idle" && !cancelled) {
            void handleScan(decodedResult.getText())
          }
        }))

        if (!cancelled) {
          setCameraPermission("granted")
          localStorage.setItem(CAMERA_PERMISSION_STORAGE_KEY, "granted")
          setIsScanning(true)
        }
      } catch (error) {
        const scanError = error as Error
        if (scanError.name === "NotAllowedError") {
          setCameraPermission("denied")
          localStorage.setItem(CAMERA_PERMISSION_STORAGE_KEY, "denied")
        } else if (scanError.name === "NotFoundError") {
          setCameraPermission("dismissed")
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      try {
        void codeReader?.decodeFromVideoElement(undefined as unknown as HTMLVideoElement, () => {
          /* noop */
        })
      } catch {
        /* ignore */
      }
      codeReaderRef.current = null
      setIsScanning(false)
    }
  }, [activeTab, eventId, cameraPermission, isScanning, scanState.type, handleScan])

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
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure scanner behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-reset delay</p>
                  <p className="text-sm text-muted-foreground">Time to wait before scanning next</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newValue = autoResetMs === 3000 ? "fast" : "normal"
                    const newMs = newValue === "fast" ? 1500 : 3000
                    localStorage.setItem(AUTO_RESET_STORAGE_KEY, newValue)
                    setAutoResetMs(newMs)
                  }}
                >
                  {autoResetMs === 3000 ? "Normal (3s)" : "Fast (1.5s)"}
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

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "camera" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">
              <QrCode className="mr-2 size-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="camera">
            <Card>
              <CardContent className="pt-6">
                <ScannerCameraView
                  videoRef={videoRef}
                  cameraPermission={cameraPermission}
                  isScanning={isScanning}
                  onStartCamera={handleStartCamera}
                  onRetryPermission={handleRetryPermission}
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
                      aria-describedby="manual-code-description"
                      placeholder="e.g., abc123xyz"
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                    />
                    <p id="manual-code-description" className="mt-1 text-xs text-muted-foreground">
                      Type or paste the ticket code manually.
                    </p>
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
