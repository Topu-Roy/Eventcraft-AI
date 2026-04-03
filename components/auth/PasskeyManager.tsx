/* eslint-disable react/no-children-prop */
"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { object, string, type infer as ZodInfer } from "zod/v4"
import { authClient } from "@/lib/auth-client"
import { useAddPasskeyMutation } from "@/hooks/auth/mutations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { PasskeyManagement } from "./passkeyManagement"

const passkeySchema = object({
  name: string().nonempty("Name is required"),
})

type PasskeyForm = ZodInfer<typeof passkeySchema>

export function PasskeyManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { mutateAsync: addPasskey, isPending: isAddPasskeyPending } = useAddPasskeyMutation()
  const { data: passkeys, isPending } = authClient.useListPasskeys()

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: passkeySchema,
    },
    onSubmit: async ({ value }) => {
      await handleAddPasskey(value)
    },
  })

  async function handleAddPasskey(data: PasskeyForm) {
    await addPasskey(
      { data },
      {
        onError: error => {
          toast.error(error.message ?? "Failed to add passkey")
          setIsDialogOpen(false)
        },
        onSuccess: () => {
          toast.success("Passkey added successfully")
          router.refresh()
          setIsDialogOpen(false)
          form.reset()
        },
      }
    )
  }

  function handleSetDialogOpen(value: boolean) {
    if (value) form.reset()
    setIsDialogOpen(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Passkeys</CardTitle>
          <Dialog
            open={isDialogOpen}
            onOpenChange={o => {
              if (o) form.reset()
              setIsDialogOpen(o)
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Passkey
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Passkey</DialogTitle>
                <DialogDescription>
                  Create a new passkey for secure, passwordless authentication.
                </DialogDescription>
              </DialogHeader>

              <form
                id="passkey-form"
                onSubmit={e => {
                  e.preventDefault()
                  void form.handleSubmit()
                }}
              >
                <FieldGroup>
                  <form.Field
                    name="name"
                    children={field => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Passkey Name</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={e => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Login button not working on mobile"
                            autoComplete="off"
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  />
                </FieldGroup>
              </form>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button type="submit" form="passkey-form">
                  {isAddPasskeyPending ? <Spinner /> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Manage your passkeys for secure, passwordless authentication.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {isPending ? (
            <p>Loading passkeys...</p>
          ) : (
            <PasskeyManagement setIsDialogOpen={handleSetDialogOpen} passkeys={passkeys ?? []} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
