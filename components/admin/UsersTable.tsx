"use client"

import { limitAtom, pageAtom, searchAtom } from "@/store/userTable"
import { useAtom, useAtomValue } from "jotai"
import { toast } from "sonner"
import { useListPaginatedUsersQuery } from "@/hooks/auth/queries"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateUserDialog } from "./CreateUserDialog"
import { UserRowActions } from "./UserRowActions"

export function UsersTable() {
  const limit = useAtomValue(limitAtom)
  const [page, setPage] = useAtom(pageAtom)
  const [search, setSearch] = useAtom(searchAtom)
  const { data: result, isPending } = useListPaginatedUsersQuery({ limit, page, search })

  const error = result?.error
  const users = result?.data?.users ?? []
  const total = result?.data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  if (error) {
    toast.error(error.message ?? "Error loading data")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <CreateUserDialog />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search users by email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-destructive">
                    {error.message ?? "Error loading data"}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.image ?? ""} />
                        <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserRowActions user={user} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
