import { AuthGuard } from "@/features/auth/components/AuthGuard"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireOnboardingComplete={false}>
      {children}
    </AuthGuard>
  )
}
