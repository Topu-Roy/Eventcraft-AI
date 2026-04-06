"use client"

import { Camera, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"

type CameraPermissionState = "prompt" | "granted" | "denied" | "dismissed"

export function ScannerCameraView({
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
