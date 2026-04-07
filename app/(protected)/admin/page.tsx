import { UsersTable } from "@/features/admin/components/UsersTable"

export const metadata = {
  title: "Admin — EventCraft AI",
  description: "Manage users, roles, and administrative tasks.",
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage users, roles, and administrative tasks.</p>
      </div>

      <UsersTable />
    </div>
  )
}
