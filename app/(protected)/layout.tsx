import { AuthGuard } from "@/features/auth/components/AuthGuard"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireOnboardingComplete={true}>
      {children}
    </AuthGuard>
  )
}
