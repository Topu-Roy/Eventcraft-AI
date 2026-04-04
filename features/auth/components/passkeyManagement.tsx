"use client"

import { type Passkey } from "@better-auth/passkey"
import { Key, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useDeletePasskeyMutation } from "@/features/auth/hooks/mutations"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

type Props = {
  passkeys: Passkey[]
  setIsDialogOpen: (value: boolean) => void
}

export function PasskeyManagement({ passkeys, setIsDialogOpen }: Props) {
  const router = useRouter()
  const { mutateAsync: deletePasskey, isPending: isDeletePasskeyPending } = useDeletePasskeyMutation()

  async function handleDeletePasskey(passkeyId: string) {
    await deletePasskey(
      { passkeyId },
      {
        onError: error => {
          toast.error(error.message ?? "Failed to delete passkey")
        },
        onSuccess: () => {
          toast.success("Passkey deleted successfully")
          router.refresh()
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {passkeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Key className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No passkeys yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Add your first passkey for secure, passwordless authentication.
          </p>
          <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Your First Passkey
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {passkeys.map(pk => (
            <div
              key={pk.id}
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{pk.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(pk.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Passkey</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this passkey? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeletePasskey(pk.id)}
                      disabled={isDeletePasskeyPending}
                    >
                      {isDeletePasskeyPending ? <Spinner /> : "Delete"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PasskeysSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="mt-1 h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl p-6">
        {/* List skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
