import type { EventFormData, EventStep } from "@/features/events/types"
import { DEFAULT_EVENT_FORM } from "@/features/events/types"
import { atom } from "jotai"

export const currentEventStepAtom = atom<EventStep>(1)

export const eventFormDataAtom = atom<EventFormData>(DEFAULT_EVENT_FORM)

export const isEventSubmittingAtom = atom(false)

export const eventIdAtom = atom<string | null>(null)
