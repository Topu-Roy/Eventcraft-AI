"use client"

import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"

export function useSeedStatus() {
  return useQuery(api.seed.getSeedStatus)
}

export function useSeedCategories() {
  return useMutation(api.seed.seedCategories)
}

export function useSeedEvents() {
  return useMutation(api.seed.seedEvents)
}

export function useClearSeedData() {
  return useMutation(api.seed.clearSeedData)
}

export function useIsAdmin() {
  return useQuery(api.seed.isAdmin)
}
