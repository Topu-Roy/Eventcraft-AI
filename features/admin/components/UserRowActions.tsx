"use client"

import { useState } from "react"
import { limitAtom, pageAtom, searchAtom } from "@/features/admin/userTable"
import { useAtomValue } from "jotai"
import { MoreHorizontal, Shield, Trash, User, UserMinus, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { useListPaginatedUsersQuery } from "@/features/auth/hooks/queries"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditUserDialog } from "./EditUserDialog"

type User = {
  id: string
  name: string
  email: string
  role?: string
  image?: string | null
  banned?: boolean | null
}

type UserRowActionsProps = {
  user: User
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const limit = useAtomValue(limitAtom)
  const page = useAtomValue(pageAtom)
  const search = useAtomValue(searchAtom)
  const { refetch } = useListPaginatedUsersQuery({ limit, page, search })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()

  function setIsEditDialogOpenState(state: boolean) {
    setIsEditDialogOpen(state)
  }

  const handleBan = async () => {
    const { error } = await authClient.admin.banUser({
      userId: user.id,
    })
    if (error) {
      toast.error(error.message ?? "Failed to ban user")
    } else {
      toast.success("User banned")
      router.refresh()
    }
  }

  const handleUnban = async () => {
    const { error } = await authClient.admin.unbanUser({
      userId: user.id,
    })
    if (error) {
      toast.error(error.message ?? "Failed to unban user")
    } else {
      toast.success("User unbanned")
      void refetch()
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return
    const { error } = await authClient.admin.removeUser({
      userId: user.id,
    })
    if (error) {
      toast.error(error.message ?? "Failed to delete user")
    } else {
      toast.success("User deleted")
      void refetch()
    }
  }

  const handleImpersonate = async () => {
    const { error } = await authClient.admin.impersonateUser({
      userId: user.id,
    })
    if (error) {
      toast.error(error.message ?? "Failed to impersonate")
    } else {
      toast.success("Impersonating user...")
      window.location.href = "/profile"
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" /> Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImpersonate}>
            <Shield className="mr-2 h-4 w-4" /> Impersonate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.banned ? (
            <DropdownMenuItem onClick={handleUnban}>
              <UserPlus className="mr-2 h-4 w-4" /> Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleBan} className="text-amber-600">
              <UserMinus className="mr-2 h-4 w-4" /> Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" /> Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        user={user}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpenState}
        onUpdated={refetch}
      />
    </>
  )
}
