import { SeedPanel } from "@/features/admin/components/SeedPanel"
import { UsersTable } from "@/features/admin/components/UsersTable"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin — EventCraft AI",
  description: "Manage users, roles, and administrative tasks.",
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-4 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage users, roles, and administrative tasks.
        </p>
      </div>

      <SeedPanel />
      <UsersTable />
    </div>
  )
}
