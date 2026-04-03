import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-server"
import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage() {
  const auth = await isAuthenticated()

  if (auth) {
    redirect("/profile")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
