"use client"

import { type ReactNode } from "react"
import { QueryClientProvider as Provider, QueryClient } from "@tanstack/react-query"

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 1, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  })

let clientQueryClientSingleton: QueryClient | undefined = undefined

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient()

  return clientQueryClientSingleton
}

export const queryClient = getQueryClient()

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return <Provider client={queryClient}>{children}</Provider>
}
