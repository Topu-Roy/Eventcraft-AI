import { PasskeyManager } from "@/features/auth/components/PasskeyManager"
import { ProfileForm } from "@/features/auth/components/ProfileForm"
import { SessionManager } from "@/features/auth/components/SessionManager"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-server"

export const metadata = {
  title: "Profile — EventCraft AI",
  description: "Manage your account settings and preferences.",
}

export default async function ProfilePage() {
  const auth = await isAuthenticated()

  if (!auth) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-8">
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
