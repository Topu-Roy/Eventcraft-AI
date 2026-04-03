import { UsersTable } from "@/components/admin/UsersTable"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, roles, and administrative tasks.</p>
      </div>
      
      <UsersTable />
    </div>
  )
}
