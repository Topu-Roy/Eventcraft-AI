"use client"

import { updateWizardData, wizardDataAtom } from "@/features/events/eventWizard"
import { useAtom } from "jotai"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EventWizardVenueScheduleStep() {
  const wizardData = useAtom(wizardDataAtom)[0]
  const [, dispatchUpdateWizardData] = useAtom(updateWizardData)

  const venueDetails = wizardData.venue ?? {
    name: "",
    address: "",
    city: "",
    country: "",
    lat: 0,
    lng: 0,
  }

  function handleUpdateVenue(venueUpdates: Partial<typeof venueDetails>) {
    dispatchUpdateWizardData({ venue: { ...venueDetails, ...venueUpdates } })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="venue-name">Venue Name</Label>
        <Input
          id="venue-name"
          placeholder="e.g., Moscone Center"
          value={venueDetails.name}
          onChange={e => handleUpdateVenue({ name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="venue-address">Address</Label>
        <Input
          id="venue-address"
          placeholder="e.g., 747 Howard St"
          value={venueDetails.address}
          onChange={e => handleUpdateVenue({ address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue-city">City</Label>
          <Input
            id="venue-city"
            placeholder="e.g., San Francisco"
            value={venueDetails.city}
            onChange={e => handleUpdateVenue({ city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="venue-country">Country</Label>
          <Input
            id="venue-country"
            placeholder="e.g., United States"
            value={venueDetails.country}
            onChange={e => handleUpdateVenue({ country: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-datetime">Start Date & Time</Label>
          <Input
            id="start-datetime"
            type="datetime-local"
            value={wizardData.startDatetime}
            onChange={e => dispatchUpdateWizardData({ startDatetime: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end-datetime">End Date & Time</Label>
          <Input
            id="end-datetime"
            type="datetime-local"
            value={wizardData.endDatetime}
            onChange={e => dispatchUpdateWizardData({ endDatetime: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="capacity">Capacity (optional)</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          placeholder="Leave empty for unlimited"
          value={wizardData.capacity ?? ""}
          onChange={e => dispatchUpdateWizardData({ capacity: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  )
}
