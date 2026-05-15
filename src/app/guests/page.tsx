import { GuestManager } from "@/components/guests/guest-manager"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { getBookings, getGuests, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function GuestsPage() {
  const [guests, bookings, rooms] = await Promise.all([
    getGuests(),
    getBookings(),
    getRooms(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Guests"
        description="Create and edit guest details while keeping booking history visible."
        action={<Button variant="outline">Export CSV</Button>}
      />
      <GuestManager guests={guests} bookings={bookings} rooms={rooms} />
    </>
  )
}
