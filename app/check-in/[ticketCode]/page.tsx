import { Ticket } from "lucide-react"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CheckInPage({ params }: { params: Promise<{ ticketCode: string }> }) {
  const { ticketCode } = await params
  const authed = await isAuthenticated()

  if (authed) {
    redirect(`/organizer/scanner?code=${ticketCode}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Ticket className="size-6 text-primary" />
          </div>
          <CardTitle>Check-In Portal</CardTitle>
          <CardDescription>
            This ticket is being checked in. Please wait for the organizer to scan your code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center font-mono text-sm break-all">{ticketCode}</div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Organizers:{" "}
              <a href="/sign-in" className="text-primary underline">
                Sign in
              </a>{" "}
              to access the scanner.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
