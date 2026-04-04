import type { AiWizardStep, ManualWizardStep } from "@/features/events/eventWizard"
import { Calendar, Eye, ImageIcon, MapPin, Sparkles } from "lucide-react"

export const AI_WIZARD_STEPS: { key: AiWizardStep; label: string; icon: typeof Sparkles }[] = [
  { key: "ai-prompt", label: "AI Prompt", icon: Sparkles },
  { key: "ai-review", label: "Review", icon: Eye },
  { key: "cover-photo", label: "Cover Photo", icon: ImageIcon },
  { key: "venue-schedule", label: "Venue & Schedule", icon: MapPin },
]

export const MANUAL_WIZARD_STEPS: { key: ManualWizardStep; label: string; icon: typeof Sparkles }[] = [
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

export const AI_STEP_DESCRIPTIONS: Record<AiWizardStep, string> = {
  "ai-prompt": "Describe your event and let AI generate the details.",
  "ai-review": "Review and edit the AI-generated event data.",
  "cover-photo": "Pick a cover photo that represents your event.",
  "venue-schedule": "Set the venue, date, and time.",
}

export const MANUAL_STEP_DESCRIPTIONS: Record<ManualWizardStep, string> = {
  details: "Fill in the basic details about your event.",
  "cover-photo": "Pick a cover photo that represents your event.",
  "venue-schedule": "Set the venue, date, and time.",
}
