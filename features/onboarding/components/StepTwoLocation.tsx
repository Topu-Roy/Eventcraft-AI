"use client"

import { useCallback, useEffect, useState } from "react"
import { stepTwoDataAtom } from "@/features/onboarding/atoms"
import { useAtom } from "jotai"
import { Loader2, MapPin, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

type StepTwoLocationProps = {
  onNext: () => void
}

type LocationResult = {
  city: string
  country: string
  countryCode: string
  lat: number
  lng: number
}

type NominatimResult = {
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    country?: string
    country_code?: string
  }
  display_name?: string
  lat: string
  lon: string
}

const GEO_TIMEOUT_MS = 5000

export function StepTwoLocation({ onNext }: StepTwoLocationProps) {
  const [stepTwoData, setStepTwoData] = useAtom(stepTwoDataAtom)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const hasValidLocation = stepTwoData.city.length > 0 && stepTwoData.country.length > 0

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    const timeoutId = setTimeout(() => {
      setIsGettingLocation(false)
      setLocationError("Location request timed out.")
    }, GEO_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      position => {
        clearTimeout(timeoutId)
        setIsGettingLocation(false)

        const { latitude, longitude } = position.coords
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        void reverseGeocode(latitude, longitude).then(result => {
          if (result) {
            setStepTwoData({
              city: result.city,
              country: result.country,
              countryCode: result.countryCode,
              lat: latitude,
              lng: longitude,
              timezone,
            })
          } else {
            setLocationError("Could not determine your location.")
          }
        })
      },
      error => {
        clearTimeout(timeoutId)
        setIsGettingLocation(false)

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location access denied.")
        } else {
          setLocationError("Could not get your location.")
        }
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS }
    )
  }

  async function reverseGeocode(lat: number, lng: number): Promise<LocationResult | null> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      if (!res.ok) return null

      const data = (await res.json()) as NominatimResult
      const address = data.address ?? {}

      return {
        city: address.city ?? address.town ?? address.village ?? address.municipality ?? "",
        country: address.country ?? "",
        countryCode: address.country_code?.toUpperCase() ?? "",
        lat,
        lng,
      }
    } catch {
      return null
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      )
      if (!res.ok) return

      const data = (await res.json()) as NominatimResult[]
      setSearchResults(
        data.map(item => ({
          city:
            item.address?.city ??
            item.address?.town ??
            item.address?.village ??
            item.display_name?.split(",")[0] ??
            "",
          country: item.address?.country ?? "",
          countryCode: item.address?.country_code?.toUpperCase() ?? "",
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      )
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        void handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  function selectLocation(result: LocationResult) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setStepTwoData({
      city: result.city,
      country: result.country,
      countryCode: result.countryCode,
      lat: result.lat,
      lng: result.lng,
      timezone,
    })
    setSearchQuery("")
    setSearchResults([])
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Where are you located?</h2>
        <p className="text-muted-foreground">We&apos;ll use this to show you events in your area.</p>
      </div>

      <div className="space-y-4">
        <Button onClick={handleGeolocation} disabled={isGettingLocation} className="w-full" variant="outline">
          {isGettingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting your location...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Use My Location
            </>
          )}
        </Button>

        {locationError && (
          <p className="text-sm text-muted-foreground">No problem &mdash; just type your city below.</p>
        )}

        <div className="space-y-2">
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for your city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isSearching && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-1 rounded-md border bg-card p-2">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.lat}-${result.lng}-${index}`}
                  type="button"
                  onClick={() => selectLocation(result)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span>{result.city}</span>
                  <span className="text-muted-foreground">{result.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {hasValidLocation && (
          <div className="rounded-md border bg-accent p-3 text-sm">
            <span className="font-medium">{stepTwoData.city}</span>
            <span className="text-muted-foreground">, {stepTwoData.country}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasValidLocation}
        className={cn(
          "w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
          hasValidLocation
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground"
        )}
      >
        Continue
      </button>
    </div>
  )
}
