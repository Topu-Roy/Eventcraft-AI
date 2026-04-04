import { atom } from "jotai"

type WizardStep = "ai-assistant" | "details" | "cover-photo" | "venue-schedule"

type CreationMode = "ai" | "manual" | null

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

type GeneratedEventData = {
  title: string
  description: string
  category: string
  tags: string[]
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

export const wizardStepAtom = atom<WizardStep>("ai-assistant")

export const creationModeAtom = atom<CreationMode>(null)

export const wizardDataAtom = atom<EventWizardData>(initialWizardData)

export const wizardEventIdAtom = atom<string | null>(null)

export const wizardIsSavingAtom = atom(false)

export const isGeneratingAtom = atom(false)

export const generatedEventDataAtom = atom<GeneratedEventData | null>(null)

export const setWizardStep = atom(null, (_get, set, step: WizardStep) => {
  set(wizardStepAtom, step)
})

export const setCreationMode = atom(null, (_get, set, mode: CreationMode) => {
  set(creationModeAtom, mode)
})

export const updateWizardData = atom(null, (_get, set, updates: Partial<EventWizardData>) => {
  set(wizardDataAtom, prev => ({ ...prev, ...updates }))
})

export const setIsGenerating = atom(null, (_get, set, isGenerating: boolean) => {
  set(isGeneratingAtom, isGenerating)
})

export const setGeneratedEventData = atom(null, (_get, set, data: GeneratedEventData | null) => {
  set(generatedEventDataAtom, data)
})

export const resetWizard = atom(null, (_get, _set) => {
  _set(wizardStepAtom, "ai-assistant")
  _set(creationModeAtom, null)
  _set(wizardDataAtom, initialWizardData)
  _set(wizardEventIdAtom, null)
  _set(wizardIsSavingAtom, false)
  _set(isGeneratingAtom, false)
  _set(generatedEventDataAtom, null)
})

export type { WizardStep, CreationMode, EventWizardData, CoverPhoto, Venue, GeneratedEventData }
