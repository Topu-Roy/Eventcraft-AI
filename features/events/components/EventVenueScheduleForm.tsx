"use client"

import type { EditableFields } from "@/features/events/types"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EventVenueScheduleFormProps = {
  formData: EditableFields
  onFieldChange: <K extends keyof EditableFields>(field: K, value: EditableFields[K]) => void
  onVenueChange: (updates: Partial<EditableFields["venue"]>) => void
}

export function EventVenueScheduleForm({ formData, onFieldChange, onVenueChange }: EventVenueScheduleFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5" />
          Venue & Schedule
        </CardTitle>
        <CardDescription>Where and when your event takes place.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="edit-venue-name">Venue Name</Label>
          <Input
            id="edit-venue-name"
            value={formData.venue.name}
            onChange={e => onVenueChange({ name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="edit-venue-address">Address</Label>
          <Input
            id="edit-venue-address"
            value={formData.venue.address}
            onChange={e => onVenueChange({ address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-venue-city">City</Label>
            <Input
              id="edit-venue-city"
              value={formData.venue.city}
              onChange={e => onVenueChange({ city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-venue-country">Country</Label>
            <Input
              id="edit-venue-country"
              value={formData.venue.country}
              onChange={e => onVenueChange({ country: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-start">Start Date & Time</Label>
            <Input
              id="edit-start"
              type="datetime-local"
              value={formData.startDatetime}
              onChange={e => onFieldChange("startDatetime", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-end">End Date & Time</Label>
            <Input
              id="edit-end"
              type="datetime-local"
              value={formData.endDatetime}
              onChange={e => onFieldChange("endDatetime", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="edit-capacity">Capacity (optional)</Label>
          <Input
            id="edit-capacity"
            type="number"
            min={1}
            placeholder="Leave empty for unlimited"
            value={formData.capacity ?? ""}
            onChange={e => onFieldChange("capacity", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
