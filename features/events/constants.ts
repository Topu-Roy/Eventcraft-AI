import type { CreationMode, WizardStep } from "@/features/events/eventWizard"
import { Calendar, ImageIcon, MapPin, Sparkles } from "lucide-react"

export const AI_WIZARD_STEPS: { key: WizardStep; label: string; icon: typeof Sparkles }[] = [
  { key: "ai-assistant", label: "AI Assistant", icon: Sparkles },
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "cover-photo", label: "Cover Photo", icon: ImageIcon },
  { key: "venue-schedule", label: "Venue & Schedule", icon: MapPin },
]

export const MANUAL_WIZARD_STEPS: { key: WizardStep; label: string; icon: typeof Sparkles }[] = [
  { key: "details", label: "Event Details", icon: Calendar },
  { key: "cover-photo", label: "Cover Photo", icon: ImageIcon },
  { key: "venue-schedule", label: "Venue & Schedule", icon: MapPin },
]

export function getWizardSteps(mode: CreationMode) {
  return mode === "ai" ? AI_WIZARD_STEPS : MANUAL_WIZARD_STEPS
}

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

export const WIZARD_STEP_DESCRIPTIONS: Record<WizardStep, string> = {
  "ai-assistant": "Describe your event and let AI set it up for you.",
  details: "Fill in the basic details about your event.",
  "cover-photo": "Pick a cover photo that represents your event.",
  "venue-schedule": "Set the venue, date, and time.",
}
