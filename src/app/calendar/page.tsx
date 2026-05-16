import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { getBookings, getGuests, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const [rooms, bookings, guests] = await Promise.all([
    getRooms({ activeOnly: true }),
    getBookings(),
    getGuests(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Calendar"
        description="Click an empty cell to create a booking, or click an existing block to edit it."
        badge={`${rooms.length} active rooms`}
        action={
          <Button asChild variant="outline">
            <a href="/settings">Manage iCal feeds</a>
          </Button>
        }
      />
      <CalendarGrid rooms={rooms} initialBookings={bookings} guests={guests} />
    </>
  )
}
