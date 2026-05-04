import { PasskeyManager } from "@/features/auth/components/PasskeyManager"
import { ProfileForm } from "@/features/auth/components/ProfileForm"
import { SessionManager } from "@/features/auth/components/SessionManager"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile — EventCraft AI",
  description: "Manage your account settings and preferences.",
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ProfileForm />
          <PasskeyManager />
        </div>
        <div>
          <SessionManager />
        </div>
      </div>
    </div>
  )
}
