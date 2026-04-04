import type { WizardStep } from "@/features/events/eventWizard"
import { Calendar, ImageIcon, MapPin, Sparkles } from "lucide-react"

export const WIZARD_STEPS: { key: WizardStep; label: string; icon: typeof Sparkles }[] = [
  { key: "ai-prompt", label: "AI Prompt", icon: Sparkles },
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "cover-photo", label: "Cover Photo", icon: ImageIcon },
  { key: "venue-schedule", label: "Venue & Schedule", icon: MapPin },
]

export const PLACEHOLDER_PHOTOS = [
  {
    url: "/placeholders/tech.svg",
    dominantColor: "#3B82F6",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/music.svg",
    dominantColor: "#8B5CF6",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/food.svg",
    dominantColor: "#F59E0B",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/sports.svg",
    dominantColor: "#10B981",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/art.svg",
    dominantColor: "#EC4899",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
  {
    url: "/placeholders/business.svg",
    dominantColor: "#6366F1",
    photographerName: "Placeholder",
    photographerUrl: "#",
  },
]

export const WIZARD_STEP_DESCRIPTIONS = [
  "Let AI help you plan your event.",
  "Fill in the basic details about your event.",
  "Pick a cover photo that represents your event.",
  "Set the venue, date, and time.",
]
