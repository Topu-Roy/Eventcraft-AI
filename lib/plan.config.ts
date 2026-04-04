export type PlanId = "free" | "pro"

export const PLANS: Record<PlanId, { maxEvents: number | null }> = {
  free: { maxEvents: 5 },
  pro: { maxEvents: null }, // null = unlimited
}

export const DEFAULT_PLAN: PlanId = "free"

/**
 * Returns the max active events allowed for a plan.
 * Null means unlimited.
 */
export function getMaxEvents(planId: PlanId): number | null {
  return PLANS[planId]?.maxEvents ?? null
}

/**
 * Checks if a profile can create another event based on their plan and current usage.
 */
export function canCreateEvent(planId: PlanId, activeCount: number): boolean {
  const limit = getMaxEvents(planId)
  return limit === null || activeCount < limit
}
