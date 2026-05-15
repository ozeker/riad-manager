"use client"

import { useState } from "react"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { toast } from "sonner"

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
import type {
  Booking,
  BookingSource,
  BookingStatus,
  Currency,
  Room,
} from "@/lib/types"

type BookingDraft = Omit<Booking, "id"> & { id?: string }

type BookingModalProps = {
  open: boolean
  booking?: Booking | null
  initialRoomId?: string
  initialDate?: string
  rooms: Room[]
  onOpenChange: (open: boolean) => void
  onSave: (booking: BookingDraft) => void
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

function addOneDay(date: string) {
  const parsed = parseISO(date)
  parsed.setDate(parsed.getDate() + 1)
  return parsed.toISOString().slice(0, 10)
}

function createEmptyDraft(roomId: string, date: string): BookingDraft {
  return {
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
  onOpenChange,
  onSave,
}: BookingModalProps) {
  const fallbackRoomId = rooms[0]?.id ?? ""
  const fallbackDate = initialDate ?? "2026-06-01"

  const initialDraft =
    booking ?? createEmptyDraft(initialRoomId ?? fallbackRoomId, fallbackDate)

  const [draft, setDraft] = useState<BookingDraft>(initialDraft)

  const mode = booking ? "Edit booking" : "Create booking"

  function updateDraft<K extends keyof BookingDraft>(
    key: K,
    value: BookingDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleSave() {
    if (!draft.guestName.trim()) {
      toast.error("Add the guest name before saving.")
      return
    }

    if (
      differenceInCalendarDays(parseISO(draft.checkOut), parseISO(draft.checkIn)) < 1
    ) {
      toast.error("Check-out must be after check-in.")
      return
    }

    onSave({
      ...draft,
      guestName: draft.guestName.trim(),
      amount: Number(draft.amount) || 0,
      guests: Number(draft.guests) || 1,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode}</DialogTitle>
          <DialogDescription>
            This prototype saves changes only in the current browser session.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="guestName">Guest name</Label>
            <Input
              id="guestName"
              value={draft.guestName}
              placeholder="Guest full name"
              onChange={(event) => updateDraft("guestName", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Room</Label>
            <Select
              value={draft.roomId}
              onValueChange={(value) => updateDraft("roomId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room" />
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
            <Label htmlFor="guests">Guests</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={draft.guests}
              onChange={(event) => updateDraft("guests", Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkIn">Check-in</Label>
            <Input
              id="checkIn"
              type="date"
              value={draft.checkIn}
              onChange={(event) => updateDraft("checkIn", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkOut">Check-out</Label>
            <Input
              id="checkOut"
              type="date"
              value={draft.checkOut}
              onChange={(event) => updateDraft("checkOut", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select
              value={draft.source}
              onValueChange={(value: BookingSource) => updateDraft("source", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={draft.status}
              onValueChange={(value: BookingStatus) => updateDraft("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={draft.amount}
              onChange={(event) => updateDraft("amount", Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={draft.currency}
              onValueChange={(value: Currency) => updateDraft("currency", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={draft.notes}
              placeholder="Arrival details, payment notes, invoice reminders"
              onChange={(event) => updateDraft("notes", event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
