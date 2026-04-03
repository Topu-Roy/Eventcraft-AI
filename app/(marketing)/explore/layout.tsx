import { AuthGuard } from "@/components/auth/AuthGuard"

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireOnboardingComplete={true}>
      {children}
    </AuthGuard>
  )
}
