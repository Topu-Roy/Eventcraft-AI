# UI Copy — EventCraft AI

## Buttons & CTAs

| Key                      | Copy                | Context                           |
| ------------------------ | ------------------- | --------------------------------- |
| `cta.getStarted`         | Get Started         | Landing — primary action          |
| `cta.signIn`             | Sign In             | Landing — secondary               |
| `cta.createEvent`        | Create Event        | Header / Dashboard                |
| `cta.explore`            | Explore Events      | Nav                               |
| `cta.register`           | Register            | Event detail — register           |
| `cta.viewTicket`         | View My Ticket      | Event detail — already registered |
| `cta.manageEvent`        | Manage Event        | Event detail — organizer          |
| `cta.save`               | Save                | Forms                             |
| `cta.publish`            | Publish             | Event edit                        |
| `cta.cancelEvent`        | Cancel Event        | Event edit                        |
| `cta.deleteEvent`        | Delete Event        | Event edit — destructive          |
| `cta.back`               | Back                | Wizard navigation                 |
| `cta.next`               | Next                | Wizard navigation                 |
| `cta.finish`             | Finish              | Onboarding final step             |
| `cta.scanQr`             | Scan QR             | Scanner page                      |
| `cta.manualEntry`        | Enter Code Manually | Scanner fallback                  |
| `cta.cancelRegistration` | Cancel Registration | Ticket detail                     |
| `cta.copyCode`           | Copy Code           | Ticket detail                     |

---

## Headings & Titles

| Key                 | Copy             | Context             |
| ------------------- | ---------------- | ------------------- |
| `title.landing`     | EventCraft AI    | Landing hero        |
| `title.explore`     | Explore Events   | Discover page       |
| `title.dashboard`   | Dashboard        | Organizer dashboard |
| `title.createEvent` | Create Event     | Creation flow       |
| `title.myTickets`   | My Tickets       | Tickets list        |
| `title.scanner`     | Check-In Scanner | Scanner page        |
| `title.profile`     | Profile          | Profile settings    |
| `title.admin`       | Admin            | Admin panel         |

---

## Subheadings / Descriptions

| Key              | Copy                                                            | Context      |
| ---------------- | --------------------------------------------------------------- | ------------ |
| `desc.landing`   | AI-powered event creation. From prompt to published in seconds. | Landing      |
| `desc.explore`   | Discover events tailored to your interests.                     | Explore page |
| `desc.dashboard` | Your events. Your metrics. All in one place.                    | Dashboard    |
| `desc.scanner`   | Scan attendee tickets for quick check-in.                       | Scanner      |

---

## Navigation Labels

| Key             | Copy       |
| --------------- | ---------- |
| `nav.explore`   | Explore    |
| `nav.dashboard` | Dashboard  |
| `nav.create`    | Create     |
| `nav.tickets`   | My Tickets |
| `nav.profile`   | Profile    |
| `nav.admin`     | Admin      |
| `nav.signOut`   | Sign Out   |

---

## Form Labels

| Key                      | Copy        | Input        |
| ------------------------ | ----------- | ------------ |
| `label.eventTitle`       | Event Title | text         |
| `label.eventDescription` | Description | textarea     |
| `label.category`         | Category    | select       |
| `label.tags`             | Tags        | multi-input  |
| `label.venueName`        | Venue Name  | text         |
| `label.venueAddress`     | Address     | text         |
| `label.city`             | City        | text         |
| `label.country`          | Country     | text         |
| `label.startDate`        | Start Date  | date         |
| `label.startTime`        | Start Time  | time         |
| `label.endDate`          | End Date    | date         |
| `label.endTime`          | End Time    | time         |
| `label.capacity`         | Capacity    | number       |
| `label.unlimited`        | Unlimited   | checkbox     |
| `label.coverPhoto`       | Cover Photo | image select |

---

## Placeholder Text

| Key                       | Copy                                              | Input              |
| ------------------------- | ------------------------------------------------- | ------------------ |
| `placeholder.prompt`      | e.g., "Tech meetup next Friday, 50 people, Dhaka" | AI creation prompt |
| `placeholder.title`       | Give your event a name                            | Event title input  |
| `placeholder.description` | What's this event about?                          | Description        |
| `placeholder.search`      | Search events...                                  | Global search      |
| `placeholder.ticketCode`  | Enter ticket code                                 | Manual check-in    |

---

## Wizard Steps (AI Creation)

| Step             | Title               | Description                                 |
| ---------------- | ------------------- | ------------------------------------------- |
| `ai-prompt`      | Describe your event | Tell us what you want. AI builds the draft. |
| `ai-review`      | Review & edit       | AI generated this. Tweak what you want.     |
| `cover-photo`    | Pick a cover        | Your event's first impression.              |
| `venue-schedule` | When & where        | Set the time and place.                     |

---

## Wizard Steps (Manual Creation)

| Step             | Title         | Description                    |
| ---------------- | ------------- | ------------------------------ |
| `details`        | Event details | Title, description, category.  |
| `cover-photo`    | Pick a cover  | Your event's first impression. |
| `venue-schedule` | When & where  | Set the time and place.        |

---

## Onboarding Steps

| Step | Title              | Description                           |
| ---- | ------------------ | ------------------------------------- |
| 1    | What are you into? | Pick categories you're interested in. |
| 2    | Where are you?     | Set your location for local events.   |
| 3    | You're all set     | Ready to discover and create.         |

---

## Empty States

| Key                     | Copy                 | Context                         |
| ----------------------- | -------------------- | ------------------------------- |
| `empty.noEvents`        | No events yet        | Dashboard — no events           |
| `empty.noTickets`       | No tickets yet       | Tickets page — no registrations |
| `empty.noSearchResults` | No events found      | Search — no results             |
| `empty.noRegistrations` | No registrations yet | Event — no attendees            |

---

## Error Messages

| Key                       | Copy                                  | Scenario                       |
| ------------------------- | ------------------------------------- | ------------------------------ |
| `error.eventFull`         | This event is full                    | Registration — at capacity     |
| `error.alreadyRegistered` | You're already registered             | Registration — duplicate       |
| `error.ownEvent`          | You can't register for your own event | Registration — organizer       |
| `error.eventCancelled`    | This event was cancelled              | Registration — cancelled event |
| `error.eventEnded`        | This event has ended                  | Registration — past event      |
| `error.invalidTicket`     | Invalid ticket code                   | Check-in — not found           |
| `error.alreadyCheckedIn`  | Already checked in                    | Check-in — duplicate           |
| `error.wrongEvent`        | Ticket is for a different event       | Check-in — event mismatch      |
| `error.planLimit`         | Plan limit reached                    | Create — free tier limit       |
| `error.network`           | Something went wrong. Try again.      | Generic network error          |

---

## Success Messages

| Key                             | Copy                   | Context          |
| ------------------------------- | ---------------------- | ---------------- |
| `success.eventCreated`          | Event created          | Event creation   |
| `success.eventPublished`        | Event published        | Event publish    |
| `success.registered`            | You're registered      | Registration     |
| `success.checkedIn`             | Checked in             | Check-in success |
| `success.registrationCancelled` | Registration cancelled | Cancellation     |

---

## Tooltips

| Key                | Copy                                       |
| ------------------ | ------------------------------------------ |
| `tooltip.search`   | Search events by name, description, or tag |
| `tooltip.capacity` | Leave empty for unlimited attendees        |
| `tooltip.tags`     | Add tags to help people find your event    |

---

## Status Badges

| Status      | Label     |
| ----------- | --------- |
| `draft`     | Draft     |
| `published` | Published |
| `completed` | Ended     |
| `cancelled` | Cancelled |

---

## Dashboard KPIs

| Label                   | Description        |
| ----------------------- | ------------------ |
| `kpi.totalRegistered`   | Total Registered   |
| `kpi.checkedIn`         | Checked In         |
| `kpi.engagementRate`    | Engagement Rate    |
| `kpi.capacityRemaining` | Capacity Remaining |

---

## Plan Labels

| Plan   | Label |
| ------ | ----- |
| `free` | Free  |
| `pro`  | Pro   |

---

## Confirmation Dialogs

| Action              | Title                | Body                              | Confirm             |
| ------------------- | -------------------- | --------------------------------- | ------------------- |
| Cancel registration | Cancel registration? | You won't be able to re-register. | Cancel registration |
| Cancel event        | Cancel event?        | This will refund all attendees.   | Cancel event        |
| Delete event        | Delete event?        | This can't be undone.             | Delete event        |
| Back from wizard    | Go back?             | You'll lose your progress.        | Go back             |
