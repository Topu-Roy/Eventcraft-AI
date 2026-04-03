import { api } from "@/convex/_generated/api"
import { notFound, redirect } from "next/navigation"
import { fetchAuthQuery } from "@/lib/auth-server"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userInfo = await fetchAuthQuery(api.auth.getUserInfo)

  if (userInfo.error) {
    if (userInfo.cause === "Unauthenticated") {
      redirect("/sign-in")
    }

    notFound()
  } else if (userInfo.data.role !== "admin") {
    notFound()
  }

  return <>{children}</>
}
