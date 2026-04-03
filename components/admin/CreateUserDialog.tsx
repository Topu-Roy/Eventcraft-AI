"use client"

import { useState } from "react"
import { limitAtom, pageAtom, searchAtom } from "@/store/userTable"
import { useAtomValue } from "jotai"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { useListPaginatedUsersQuery } from "@/hooks/auth/queries"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateUserDialog() {
  const limit = useAtomValue(limitAtom)
  const page = useAtomValue(pageAtom)
  const search = useAtomValue(searchAtom)
  const { refetch } = useListPaginatedUsersQuery({ limit, page, search })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.admin.createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role as "user",
    })

    if (error) {
      toast.error(error.message ?? "Failed to create user")
      setLoading(false)
    } else {
      toast.success("User created successfully")
      setOpen(false)
      void refetch()
      setFormData({ name: "", email: "", password: "", role: "user" })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system manually.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-role">Role</Label>
              <Select value={formData.role} onValueChange={val => setFormData({ ...formData, role: val })}>
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
