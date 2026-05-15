import { BookingManager } from "@/components/bookings/booking-manager"
import { PageHeader } from "@/components/layout/page-header"
import { getBookings, getGuests, getPayments, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function BookingsPage() {
  const [bookings, rooms, guests, payments] = await Promise.all([
    getBookings(),
    getRooms(),
    getGuests(),
    getPayments(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Create, edit, cancel, and archive reservations while keeping payment status visible."
      />
      <BookingManager
        bookings={bookings}
        rooms={rooms}
        guests={guests}
        payments={payments}
      />
    </>
  )
}
