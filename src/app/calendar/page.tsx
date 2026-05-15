import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { getBookings, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const [rooms, bookings] = await Promise.all([
    getRooms({ activeOnly: true }),
    getBookings(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Calendar"
        description="Click an empty cell to create a booking, or click an existing block to edit it."
        badge="Mock data"
        action={<Button variant="outline">Import iCal later</Button>}
      />
      <CalendarGrid rooms={rooms} initialBookings={bookings} />
    </>
  )
}
