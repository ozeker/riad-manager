import type { Booking, BookingStatus } from "@/lib/types"

const nonBlockingStatuses = new Set<BookingStatus>(["cancelled", "no show"])

export function bookingBlocksAvailability(status: BookingStatus) {
  return !nonBlockingStatuses.has(status)
}

export function dateRangesOverlap(
  leftCheckIn: string,
  leftCheckOut: string,
  rightCheckIn: string,
  rightCheckOut: string
) {
  return leftCheckIn < rightCheckOut && leftCheckOut > rightCheckIn
}

export function findBookingAvailabilityConflict(
  draft: Pick<Booking, "roomId" | "checkIn" | "checkOut" | "status"> & {
    id?: string
  },
  bookings: Booking[]
) {
  if (!bookingBlocksAvailability(draft.status)) {
    return null
  }

  return (
    bookings.find(
      (booking) =>
        booking.id !== draft.id &&
        booking.roomId === draft.roomId &&
        bookingBlocksAvailability(booking.status) &&
        dateRangesOverlap(
          draft.checkIn,
          draft.checkOut,
          booking.checkIn,
          booking.checkOut
        )
    ) ?? null
  )
}
