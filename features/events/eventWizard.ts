import { atom } from "jotai"

type AiWizardStep = "ai-prompt" | "ai-review" | "cover-photo" | "venue-schedule"
type ManualWizardStep = "details" | "cover-photo" | "venue-schedule"
type Pipeline = "ai" | "manual" | null

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

// Pipeline selection
export const selectedPipelineAtom = atom<Pipeline>(null)

// AI Pipeline state
export const aiWizardStepAtom = atom<AiWizardStep>("ai-prompt")
export const aiPromptTextAtom = atom("")
export const aiGeneratedDataAtom = atom<GeneratedEventData | null>(null)
export const aiModificationTextAtom = atom("")
export const aiIsModifyingAtom = atom(false)

// Manual Pipeline state
export const manualWizardStepAtom = atom<ManualWizardStep>("details")

// Shared state (both pipelines write here)
export const wizardDataAtom = atom<EventWizardData>(initialWizardData)
export const wizardEventIdAtom = atom<string | null>(null)
export const wizardIsSavingAtom = atom(false)
export const isGeneratingAtom = atom(false)

// Setters
export const setSelectedPipeline = atom(null, (_get, set, pipeline: Pipeline) => {
  set(selectedPipelineAtom, pipeline)
})

export const setAiWizardStep = atom(null, (_get, set, step: AiWizardStep) => {
  set(aiWizardStepAtom, step)
})

export const setAiPromptText = atom(null, (_get, set, text: string) => {
  set(aiPromptTextAtom, text)
})

export const setAiGeneratedData = atom(null, (_get, set, data: GeneratedEventData | null) => {
  set(aiGeneratedDataAtom, data)
})

export const setAiModificationText = atom(null, (_get, set, text: string) => {
  set(aiModificationTextAtom, text)
})

export const setIsAiModifying = atom(null, (_get, set, isModifying: boolean) => {
  set(aiIsModifyingAtom, isModifying)
})

export const setManualWizardStep = atom(null, (_get, set, step: ManualWizardStep) => {
  set(manualWizardStepAtom, step)
})

export const updateWizardData = atom(null, (_get, set, updates: Partial<EventWizardData>) => {
  set(wizardDataAtom, prev => ({ ...prev, ...updates }))
})

export const setIsGenerating = atom(null, (_get, set, isGenerating: boolean) => {
  set(isGeneratingAtom, isGenerating)
})

export const setWizardEventId = atom(null, (_get, set, id: string | null) => {
  set(wizardEventIdAtom, id)
})

export const setIsSavingDraft = atom(null, (_get, set, isSaving: boolean) => {
  set(wizardIsSavingAtom, isSaving)
})

export const resetWizard = atom(null, (_get, set) => {
  set(selectedPipelineAtom, null)
  set(aiWizardStepAtom, "ai-prompt")
  set(aiPromptTextAtom, "")
  set(aiGeneratedDataAtom, null)
  set(aiModificationTextAtom, "")
  set(aiIsModifyingAtom, false)
  set(manualWizardStepAtom, "details")
  set(wizardDataAtom, initialWizardData)
  set(wizardEventIdAtom, null)
  set(wizardIsSavingAtom, false)
  set(isGeneratingAtom, false)
})

export type { AiWizardStep, ManualWizardStep, Pipeline, EventWizardData, CoverPhoto, Venue, GeneratedEventData }
