"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import {
  BookingDraft,
  BookingModal,
} from "@/components/calendar/booking-modal"
import { useLanguage } from "@/components/i18n/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatMoney } from "@/lib/format"
import type { Booking, Guest, Payment, PaymentStatus, Room } from "@/lib/types"

type BookingManagerProps = {
  bookings: Booking[]
  rooms: Room[]
  guests: Guest[]
  payments: Payment[]
}

function getPaymentStatus(booking: Booking, payments: Payment[]): PaymentStatus {
  const paid = payments
    .filter(
      (payment) =>
        payment.bookingId === booking.id && payment.currency === booking.currency
    )
    .reduce((total, payment) => total + payment.amount, 0)

  if (paid <= 0) return "unpaid"
  if (paid >= booking.amount) return "paid"
  return "partial"
}

const paymentStatusVariant: Record<
  PaymentStatus,
  "default" | "secondary" | "outline"
> = {
  unpaid: "outline",
  partial: "secondary",
  paid: "default",
}

export function BookingManager({
  bookings: initialBookings,
  rooms,
  guests: initialGuests,
  payments,
}: BookingManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [bookings, setBookings] = useState(initialBookings)
  const [guests, setGuests] = useState(initialGuests)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [creating, setCreating] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  const activeRooms = useMemo(
    () => rooms.filter((room) => room.active),
    [rooms]
  )
  const modalRooms = activeRooms.length > 0 ? activeRooms : rooms

  function openCreate() {
    setModalKey((current) => current + 1)
    setSelectedBooking(null)
    setCreating(true)
  }

  function openEdit(booking: Booking) {
    setModalKey((current) => current + 1)
    setCreating(false)
    setSelectedBooking(booking)
  }

  function closeModal(open: boolean) {
    if (!open) {
      setCreating(false)
      setSelectedBooking(null)
    }
  }

  async function saveBooking(draft: BookingDraft) {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draft),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.message ?? t("Could not save booking."))
    }

    const savedBooking = (await response.json()) as Booking

    setBookings((current) => {
      const exists = current.some((booking) => booking.id === savedBooking.id)
      if (exists) {
        return current.map((booking) =>
          booking.id === savedBooking.id ? savedBooking : booking
        )
      }

      return [...current, savedBooking]
    })

    if (
      savedBooking.guestId &&
      !guests.some((guest) => guest.id === savedBooking.guestId)
    ) {
      setGuests((current) => [
        ...current,
        {
          id: savedBooking.guestId,
          fullName: savedBooking.guestName,
          phone: "",
          email: "",
          nationality: "",
          documentNumber: "",
          notes: "",
        },
      ])
    }

    toast.success(draft.id ? t("Booking updated") : t("Booking created"))
    closeModal(false)
    router.refresh()
  }

  async function cancelBooking(booking: Booking) {
    await saveBooking({ ...booking, status: "cancelled" })
  }

  async function archiveBooking(booking: Booking) {
    const response = await fetch(`/api/bookings?id=${booking.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(t("Could not archive booking."))
    }

    setBookings((current) => current.filter((item) => item.id !== booking.id))
    toast.success(t("Booking archived"))
    closeModal(false)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t("New booking")}
        </Button>
      </div>

      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Guest")}</TableHead>
                <TableHead>{t("Room")}</TableHead>
                <TableHead>{t("Source")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Payment")}</TableHead>
                <TableHead>{t("Stay")}</TableHead>
                <TableHead className="text-right">{t("Amount")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const room = rooms.find((item) => item.id === booking.roomId)
                const paymentStatus = getPaymentStatus(booking, payments)

                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.guestName}
                    </TableCell>
                    <TableCell>{room?.name ?? t("Unknown room")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.status === "cancelled" ? "outline" : "secondary"}>
                        {t(booking.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant[paymentStatus]}>
                        {t(paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.checkIn} {t("to")} {booking.checkOut}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMoney(booking.amount, booking.currency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">
                              Booking actions for {booking.guestName}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(booking)}>
                            <Pencil className="size-4" />
                            {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => cancelBooking(booking)}>
                            {t("Cancel booking")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => archiveBooking(booking)}>
                            {t("Archive")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookingModal
        key={modalKey}
        open={creating || selectedBooking !== null}
        booking={selectedBooking}
        rooms={modalRooms}
        guests={guests}
        existingBookings={bookings}
        onOpenChange={closeModal}
        onSave={saveBooking}
        onCancelBooking={cancelBooking}
        onDeleteBooking={archiveBooking}
      />
    </>
  )
}
