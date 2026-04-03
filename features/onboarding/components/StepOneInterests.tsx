"use client"

import { api } from "@/convex/_generated/api"
import { stepOneDataAtom } from "@/features/onboarding/atoms"
import { useQuery } from "convex/react"
import { useAtom } from "jotai"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type StepOneInterestsProps = {
  onNext: () => void
}

export function StepOneInterests({ onNext }: StepOneInterestsProps) {
  const [stepOneData, setStepOneData] = useAtom(stepOneDataAtom)
  const categories = useQuery(api.categories.list)

  function toggleInterest(slug: string) {
    setStepOneData(prev => ({
      interests: prev.interests.includes(slug)
        ? prev.interests.filter(s => s !== slug)
        : [...prev.interests, slug],
    }))
  }

  const hasSelection = stepOneData.interests.length > 0

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">What are you interested in?</h2>
        <p className="text-muted-foreground">Select at least one category to personalize your experience.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories?.map(category => {
          const isSelected = stepOneData.interests.includes(category.slug)
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => toggleInterest(category.slug)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <span className="text-lg">{getCategoryIcon(category.iconName)}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasSelection}
        className={cn(
          "w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
          hasSelection
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground"
        )}
      >
        Continue
      </button>
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
