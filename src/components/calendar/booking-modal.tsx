"use client"

import { useState } from "react"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { AlertTriangle, Archive, Ban } from "lucide-react"
import { toast } from "sonner"

import { useLanguage } from "@/components/i18n/language-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { findBookingAvailabilityConflict } from "@/lib/booking-availability"
import type {
  Booking,
  BookingSource,
  BookingStatus,
  Currency,
  Guest,
  Room,
} from "@/lib/types"

export type BookingDraft = Omit<Booking, "id"> & { id?: string }

type BookingModalProps = {
  open: boolean
  booking?: Booking | null
  initialRoomId?: string
  initialDate?: string
  rooms: Room[]
  guests: Guest[]
  existingBookings?: Booking[]
  onOpenChange: (open: boolean) => void
  onSave: (booking: BookingDraft) => Promise<void> | void
  onCancelBooking?: (booking: Booking) => Promise<void> | void
  onDeleteBooking?: (booking: Booking) => Promise<void> | void
}

const sources: BookingSource[] = [
  "Booking.com",
  "Airbnb",
  "HotelRunner",
  "Direct",
  "Walk-in",
  "Other",
]

const currencies: Currency[] = ["MAD", "EUR", "USD"]

const statuses: BookingStatus[] = [
  "confirmed",
  "checked in",
  "checked out",
  "cancelled",
  "no show",
]

const newGuestValue = "__new_guest__"

function addOneDay(date: string) {
  const parsed = parseISO(date)
  parsed.setDate(parsed.getDate() + 1)
  return parsed.toISOString().slice(0, 10)
}

function createEmptyDraft(roomId: string, date: string): BookingDraft {
  return {
    guestId: "",
    guestName: "",
    roomId,
    checkIn: date,
    checkOut: addOneDay(date),
    guests: 2,
    source: "Direct",
    amount: 0,
    currency: "MAD",
    status: "confirmed",
    notes: "",
  }
}

export function BookingModal({
  open,
  booking,
  initialRoomId,
  initialDate,
  rooms,
  guests,
  existingBookings = [],
  onOpenChange,
  onSave,
  onCancelBooking,
  onDeleteBooking,
}: BookingModalProps) {
  const { t } = useLanguage()
  const fallbackRoomId = rooms[0]?.id ?? ""
  const fallbackDate = initialDate ?? "2026-06-01"
  const initialDraft =
    booking ?? createEmptyDraft(initialRoomId ?? fallbackRoomId, fallbackDate)

  const [draft, setDraft] = useState<BookingDraft>(initialDraft)
  const [saving, setSaving] = useState(false)
  const [destructiveAction, setDestructiveAction] = useState<
    "cancel" | "delete" | null
  >(null)

  const mode = booking ? t("Edit booking") : t("Create booking")
  const selectedGuestValue = draft.guestId || newGuestValue
  const isNewGuest = selectedGuestValue === newGuestValue
  const availabilityConflict = findBookingAvailabilityConflict(
    draft,
    existingBookings
  )

  function updateDraft<K extends keyof BookingDraft>(
    key: K,
    value: BookingDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    if (!draft.guestId && !draft.guestName.trim()) {
      toast.error(t("Choose an existing guest or add a new guest name."))
      return
    }

    if (
      differenceInCalendarDays(parseISO(draft.checkOut), parseISO(draft.checkIn)) < 1
    ) {
      toast.error(t("Check-out must be after check-in."))
      return
    }

    if (availabilityConflict) {
      toast.error(
        `${t("Room already booked for")} ${availabilityConflict.guestName} ${t("on those dates.")}`
      )
      return
    }

    setSaving(true)
    try {
      await onSave({
        ...draft,
        guestName: draft.guestName.trim(),
        amount: Number(draft.amount) || 0,
        guests: Number(draft.guests) || 1,
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("The booking could not be saved.")
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelBooking() {
    if (!booking || !onCancelBooking) return

    setDestructiveAction("cancel")
    try {
      await onCancelBooking(booking)
    } catch {
      toast.error(t("The booking could not be cancelled."))
    } finally {
      setDestructiveAction(null)
    }
  }

  async function handleDeleteBooking() {
    if (!booking || !onDeleteBooking) return

    setDestructiveAction("delete")
    try {
      await onDeleteBooking(booking)
    } catch {
      toast.error(t("The booking could not be archived."))
    } finally {
      setDestructiveAction(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode}</DialogTitle>
          <DialogDescription>
            {t("Booking changes are saved to the PostgreSQL database.")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("Guest")}</Label>
            <Select
              value={selectedGuestValue}
              onValueChange={(value) => {
                if (value === newGuestValue) {
                  updateDraft("guestId", "")
                  updateDraft("guestName", "")
                  return
                }

                const guest = guests.find((item) => item.id === value)
                updateDraft("guestId", value)
                updateDraft("guestName", guest?.fullName ?? "")
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Choose guest")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={newGuestValue}>{t("New guest")}</SelectItem>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isNewGuest ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="guestName">{t("New guest name")}</Label>
              <Input
                id="guestName"
                value={draft.guestName}
                placeholder={t("Guest full name")}
                onChange={(event) => updateDraft("guestName", event.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>{t("Room")}</Label>
            <Select
              value={draft.roomId}
              onValueChange={(value) => updateDraft("roomId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select room")} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">{t("Guests")}</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={draft.guests}
              onChange={(event) => updateDraft("guests", Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkIn">{t("Check-in")}</Label>
            <Input
              id="checkIn"
              type="date"
              value={draft.checkIn}
              onChange={(event) => updateDraft("checkIn", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkOut">{t("Check-out")}</Label>
            <Input
              id="checkOut"
              type="date"
              value={draft.checkOut}
              onChange={(event) => updateDraft("checkOut", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Source")}</Label>
            <Select
              value={draft.source}
              onValueChange={(value: BookingSource) => updateDraft("source", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select source")} />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {t(source)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("Status")}</Label>
            <Select
              value={draft.status}
              onValueChange={(value: BookingStatus) => updateDraft("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select status")} />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t("Amount")}</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={draft.amount}
              onChange={(event) => updateDraft("amount", Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Currency")}</Label>
            <Select
              value={draft.currency}
              onValueChange={(value: Currency) => updateDraft("currency", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select currency")} />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">{t("Notes")}</Label>
            <Textarea
              id="notes"
              value={draft.notes}
              placeholder={t("Arrival details, payment notes, invoice reminders")}
              onChange={(event) => updateDraft("notes", event.target.value)}
            />
          </div>

          {availabilityConflict ? (
            <div className="flex gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950 sm:col-span-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">{t("Room already booked")}</p>
                <p className="mt-1 text-amber-900">
                  {availabilityConflict.guestName} {t("already has this room from")}{" "}
                  {availabilityConflict.checkIn} {t("to")} {availabilityConflict.checkOut}.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            {booking && onCancelBooking ? (
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                disabled={saving || destructiveAction !== null}
              >
                <Ban className="size-4" />
                {destructiveAction === "cancel" ? t("Cancelling...") : t("Cancel booking")}
              </Button>
            ) : null}
            {booking && onDeleteBooking ? (
              <Button
                variant="outline"
                onClick={handleDeleteBooking}
                disabled={saving || destructiveAction !== null}
              >
                <Archive className="size-4" />
                {destructiveAction === "delete" ? t("Archiving...") : t("Archive")}
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || destructiveAction !== null}
            >
              {t("Close")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                destructiveAction !== null ||
                availabilityConflict !== null
              }
            >
              {saving ? t("Saving...") : t("Save booking")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
