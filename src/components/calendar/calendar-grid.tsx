"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  differenceInCalendarDays,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { BookingBlock } from "@/components/calendar/booking-block"
import { BookingModal } from "@/components/calendar/booking-modal"
import { useLanguage } from "@/components/i18n/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Booking, BookingSource, Guest, Room } from "@/lib/types"
import { cn } from "@/lib/utils"

const calendarStart = new Date(2026, 5, 1)
const dayCount = 12

const sourceLegend: Record<BookingSource, string> = {
  "Booking.com": "bg-sky-500",
  Airbnb: "bg-rose-500",
  HotelRunner: "bg-violet-500",
  Direct: "bg-emerald-500",
  "Walk-in": "bg-amber-500",
  Other: "bg-zinc-500",
}

function visibleSpan(booking: Booking, dates: Date[]) {
  const start = differenceInCalendarDays(parseISO(booking.checkIn), dates[0])
  const end = differenceInCalendarDays(parseISO(booking.checkOut), dates[0])
  const clampedStart = Math.max(0, start)
  const clampedEnd = Math.min(dates.length, end)

  if (clampedEnd <= clampedStart) return null

  return {
    gridColumn: `${clampedStart + 1} / ${clampedEnd + 1}`,
  }
}

type CalendarGridProps = {
  rooms: Room[]
  initialBookings: Booking[]
  guests: Guest[]
}

export function CalendarGrid({
  rooms,
  initialBookings,
  guests: initialGuests,
}: CalendarGridProps) {
  const { t } = useLanguage()
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [draftCell, setDraftCell] = useState<{
    roomId: string
    date: string
  } | null>(null)
  const [modalKey, setModalKey] = useState(0)

  const dates = useMemo(
    () => Array.from({ length: dayCount }, (_, index) => addDays(calendarStart, index)),
    []
  )

  const gridStyle = {
    gridTemplateColumns: `repeat(${dates.length}, minmax(7rem, 1fr))`,
  }

  const visibleRoomIds = useMemo(
    () => new Set(rooms.map((room) => room.id)),
    [rooms]
  )

  function openCreate(roomId: string, date: Date) {
    setModalKey((current) => current + 1)
    setSelectedBooking(null)
    setDraftCell({ roomId, date: format(date, "yyyy-MM-dd") })
  }

  function openEdit(booking: Booking) {
    setModalKey((current) => current + 1)
    setDraftCell(null)
    setSelectedBooking(booking)
  }

  function closeModal(open: boolean) {
    if (!open) {
      setSelectedBooking(null)
      setDraftCell(null)
    }
  }

  async function handleSave(draft: Omit<Booking, "id"> & { id?: string }) {
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

    if (draft.id) {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === savedBooking.id ? savedBooking : booking
        )
      )
      toast.success(t("Booking updated"))
    } else {
      setBookings((current) => [...current, savedBooking])
      toast.success(t("Booking created"))
    }

    setSelectedBooking(null)
    setDraftCell(null)
  }

  async function handleCancelBooking(booking: Booking) {
    await handleSave({ ...booking, status: "cancelled" })
  }

  async function handleDeleteBooking(booking: Booking) {
    const response = await fetch(`/api/bookings?id=${booking.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(t("Could not archive booking."))
    }

    setBookings((current) => current.filter((item) => item.id !== booking.id))
    setSelectedBooking(null)
    setDraftCell(null)
    toast.success(t("Booking archived"))
  }

  const nightsInView = bookings.filter(
    (booking) =>
      visibleRoomIds.has(booking.roomId) &&
      dates.some((date) =>
        isWithinInterval(date, {
          start: parseISO(booking.checkIn),
          end: addDays(parseISO(booking.checkOut), -1),
        })
      )
  )

  return (
    <>
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">{t("Reservation calendar")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("Rooms are rows, dates are columns, and booking colors show source.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(sourceLegend) as BookingSource[]).map((source) => (
                <Badge key={source} variant="outline" className="gap-2">
                  <span
                    className={cn("size-2 rounded-full", sourceLegend[source])}
                  />
                  {t(source)}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />

          <div className="overflow-x-auto">
            <div className="min-w-[1120px]">
              <div className="grid grid-cols-[12rem_1fr] border-b bg-muted/40">
                <div className="sticky left-0 z-20 flex items-center border-r bg-muted/95 px-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {t("Room")}
                </div>
                <div className="grid" style={gridStyle}>
                  {dates.map((date) => (
                    <div
                      key={date.toISOString()}
                      className="border-r px-3 py-3 text-center last:border-r-0"
                    >
                      <p className="text-xs text-muted-foreground">
                        {format(date, "EEE")}
                      </p>
                      <p className="text-sm font-semibold">{format(date, "MMM d")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {rooms.map((room) => {
                const roomBookings = bookings.filter(
                  (booking) => booking.roomId === room.id
                )

                return (
                  <div
                    key={room.id}
                    className="grid min-h-20 grid-cols-[12rem_1fr] border-b last:border-b-0"
                  >
                    <div className="sticky left-0 z-20 flex flex-col justify-center border-r bg-card px-4">
                      <p className="truncate text-sm font-semibold">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("Sleeps")} {room.capacity}
                      </p>
                    </div>
                    <div className="relative min-h-20">
                      <div className="grid min-h-20" style={gridStyle}>
                        {dates.map((date) => (
                          <button
                            key={`${room.id}-${date.toISOString()}`}
                            type="button"
                            onClick={() => openCreate(room.id, date)}
                            className="group flex items-center justify-center border-r text-muted-foreground transition hover:bg-emerald-50 last:border-r-0"
                          >
                            <Plus className="size-4 opacity-0 transition group-hover:opacity-100" />
                            <span className="sr-only">
                              {t("Create booking for")} {room.name} {t("on")}{" "}
                              {format(date, "MMMM d, yyyy")}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div
                        className="pointer-events-none absolute inset-0 grid"
                        style={gridStyle}
                      >
                        {roomBookings.map((booking) => {
                          const span = visibleSpan(booking, dates)
                          if (!span) return null

                          return (
                            <BookingBlock
                              key={booking.id}
                              booking={booking}
                              style={span}
                              onClick={() => openEdit(booking)}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{nightsInView.length} {t("bookings visible in this view")}</span>
            <Button
              variant="outline"
              disabled={rooms.length === 0}
              onClick={() => {
                const firstRoom = rooms[0]
                if (firstRoom) openCreate(firstRoom.id, dates[0])
              }}
            >
              <Plus className="size-4" />
              {t("New booking")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingModal
        key={modalKey}
        open={Boolean(selectedBooking || draftCell)}
        booking={selectedBooking}
        initialRoomId={draftCell?.roomId}
        initialDate={draftCell?.date}
        rooms={rooms}
        guests={guests}
        existingBookings={bookings}
        onOpenChange={closeModal}
        onSave={handleSave}
        onCancelBooking={handleCancelBooking}
        onDeleteBooking={handleDeleteBooking}
      />
    </>
  )
}
