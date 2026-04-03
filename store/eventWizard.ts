import { atom } from "jotai"

type WizardStep = "ai-prompt" | "details" | "cover-photo" | "venue-schedule"

type CoverPhoto = {
  url: string
  dominantColor: string
  photographerName: string
  photographerUrl: string
}

type Venue = {
  name: string
  address: string
  city: string
  country: string
  lat: number
  lng: number
}

type EventWizardData = {
  title: string
  description: string
  category: string
  tags: string[]
  coverPhoto: CoverPhoto | null
  venue: Venue | null
  startDatetime: string
  endDatetime: string
  capacity: number | null
}

const initialWizardData: EventWizardData = {
  title: "",
  description: "",
  category: "",
  tags: [],
  coverPhoto: null,
  venue: null,
  startDatetime: "",
  endDatetime: "",
  capacity: null,
}

export const wizardStepAtom = atom<WizardStep>("ai-prompt")

export const wizardDataAtom = atom<EventWizardData>(initialWizardData)

export const wizardEventIdAtom = atom<string | null>(null)

export const wizardIsSavingAtom = atom(false)

export const setWizardStep = atom(null, (_get, set, step: WizardStep) => {
  set(wizardStepAtom, step)
})

export const updateWizardData = atom(null, (_get, set, updates: Partial<EventWizardData>) => {
  set(wizardDataAtom, prev => ({ ...prev, ...updates }))
})

export const resetWizard = atom(null, (_get, _set) => {
  _set(wizardStepAtom, "ai-prompt")
  _set(wizardDataAtom, initialWizardData)
  _set(wizardEventIdAtom, null)
  _set(wizardIsSavingAtom, false)
})

export type { WizardStep, EventWizardData, CoverPhoto, Venue }
