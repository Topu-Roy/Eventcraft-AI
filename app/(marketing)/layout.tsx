import { AuthGuard } from "@/components/auth/AuthGuard"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false} requireOnboardingComplete={false}>
      {children}
    </AuthGuard>
  )
}
