"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { stepOneDataAtom } from "@/features/onboarding/atoms"
import { useMutation, useQuery } from "convex/react"
import { useAtom } from "jotai"
import { Check, Loader2, Shield } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { tryCatch } from "@/lib/try-catch"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type StepOneInterestsProps = {
  onNext: () => void
}

export function StepOneInterests({ onNext }: StepOneInterestsProps) {
  const [stepOneData, setStepOneData] = useAtom(stepOneDataAtom)
  const categories = useQuery(api.categories.list)
  const session = authClient.useSession()
  const seedCategories = useMutation(api.seed.seedCategories)
  const [isSeeding, setIsSeeding] = useState(false)

  function toggleInterest(slug: string) {
    setStepOneData(prev => ({
      interests: prev.interests.includes(slug)
        ? prev.interests.filter(s => s !== slug)
        : [...prev.interests, slug],
    }))
  }

  async function handleSeed() {
    setIsSeeding(true)
    const result = await tryCatch(() => seedCategories())
    if (result.error) {
      toast.error(result.error.message)
    } else if (result.data?.error) {
      toast.error(result.data.cause)
    } else {
      toast.success(result.data?.data?.message)
    }
    setIsSeeding(false)
  }

  const hasSelection = stepOneData.interests.length > 0

  if (categories === undefined) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">What are you interested in?</h2>
          <p className="text-muted-foreground">
            Pick categories you&apos;re interested in. You&apos;ll see events like these.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading categories...
        </div>
      </div>
    )
  }

  if (!categories.length) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">What are you interested in?</h2>
          <p className="text-muted-foreground">
            Pick categories you&apos;re interested in. You&apos;ll see events like these.
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No categories available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.data?.user.role === "admin"
              ? "Click below to seed the database with default categories."
              : "An admin needs to seed the database with default categories."}
          </p>
          {session.data?.user.role === "admin" ? (
            <Button onClick={handleSeed} disabled={isSeeding} className="mt-4" variant="outline">
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Shield className="mr-2 size-4" />
                  Seed Categories
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What are you interested in?</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Pick categories you&apos;re interested in. You&apos;ll see events like these.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map(category => {
          const isSelected = stepOneData.interests.includes(category.slug)
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => toggleInterest(category.slug)}
              className={cn(
                "relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 text-center transition-all sm:min-h-28 sm:p-4",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <span className="text-xl sm:text-2xl">{getCategoryIcon(category.iconName)}</span>
              <span className="text-xs font-medium sm:text-sm">{category.name}</span>
            </button>
          )
        })}
      </div>

      <Button onClick={onNext} disabled={!hasSelection} className="min-h-11 w-full">
        Continue
      </Button>
    </div>
  )
}

function getCategoryIcon(iconName: string) {
  const iconMap: Record<string, string> = {
    cpu: "💻",
    music: "🎵",
    palette: "🎨",
    trophy: "🏆",
    utensils: "🍽️",
    briefcase: "💼",
    heart: "❤️",
    "book-open": "📚",
    users: "👥",
    "gamepad-2": "🎮",
  }
  return iconMap[iconName] || "📌"
}
