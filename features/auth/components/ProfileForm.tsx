"use client"

import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { tryCatch } from "@/lib/try-catch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function ProfileForm() {
  const { data: session, isPending } = authClient.useSession()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [image, setImage] = useState(session?.user?.image ?? "")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await tryCatch(() => authClient.updateUser({ name, image }))
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success("Profile updated")
    }
    setLoading(false)
  }

  if (isPending) return <p>Loading profile...</p>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdate}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="min-h-10" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={session?.user?.email ?? ""} disabled className="min-h-10 bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="min-h-10"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="min-h-10">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
