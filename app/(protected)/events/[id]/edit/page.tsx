import { EditEvent } from "../../../../../features/events/components/EditEvent"

export default async function EditEventPage({ params }: PageProps<"/events/[id]/edit">) {
  const id = (await params).id

  return <EditEvent eventId={id} />
}
