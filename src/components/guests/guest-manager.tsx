"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

import { useLanguage } from "@/components/i18n/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { formatMoney } from "@/lib/format"
import type { Booking, Guest, Room } from "@/lib/types"

type GuestDraft = Omit<Guest, "id"> & { id?: string }

type GuestManagerProps = {
  guests: Guest[]
  bookings: Booking[]
  rooms: Room[]
}

const emptyGuest: GuestDraft = {
  fullName: "",
  phone: "",
  email: "",
  nationality: "",
  documentNumber: "",
  notes: "",
}

function getGuestBookings(guestId: string, bookings: Booking[]) {
  return bookings.filter((booking) => booking.guestId === guestId)
}

export function GuestManager({
  guests: initialGuests,
  bookings,
  rooms,
}: GuestManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [guests, setGuests] = useState(initialGuests)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<GuestDraft>(emptyGuest)
  const [saving, setSaving] = useState(false)

  const roomNameById = useMemo(
    () => new Map(rooms.map((room) => [room.id, room.name])),
    [rooms]
  )

  const selectedGuestBookings = draft.id
    ? getGuestBookings(draft.id, bookings)
    : []

  function openCreate() {
    setDraft(emptyGuest)
    setOpen(true)
  }

  function openEdit(guest: Guest) {
    setDraft(guest)
    setOpen(true)
  }

  function updateDraft<K extends keyof GuestDraft>(
    key: K,
    value: GuestDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function saveGuest() {
    if (!draft.fullName.trim()) {
      toast.error(t("Guest name is required."))
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        throw new Error(t("Could not save guest."))
      }

      const savedGuest = (await response.json()) as Guest

      setGuests((current) => {
        const exists = current.some((guest) => guest.id === savedGuest.id)
        if (exists) {
          return current.map((guest) =>
            guest.id === savedGuest.id ? savedGuest : guest
          )
        }

        return [...current, savedGuest].sort((left, right) =>
          left.fullName.localeCompare(right.fullName)
        )
      })

      toast.success(draft.id ? t("Guest updated") : t("Guest created"))
      setOpen(false)
      router.refresh()
    } catch {
      toast.error(t("The guest could not be saved."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t("New guest")}
        </Button>
      </div>

      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Phone")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Nationality")}</TableHead>
                <TableHead>{t("ID / Passport")}</TableHead>
                <TableHead>{t("Booking history")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => {
                const guestBookings = getGuestBookings(guest.id, bookings)
                const latestBooking = guestBookings[guestBookings.length - 1]

                return (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium">{guest.fullName}</TableCell>
                    <TableCell>{guest.phone || "-"}</TableCell>
                    <TableCell>{guest.email || "-"}</TableCell>
                    <TableCell>{guest.nationality || "-"}</TableCell>
                    <TableCell>{guest.documentNumber || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit">
                          {guestBookings.length} {t(guestBookings.length === 1 ? "booking" : "bookings")}
                        </Badge>
                        {latestBooking ? (
                          <span className="text-xs text-muted-foreground">
                            Last: {latestBooking.checkIn} ·{" "}
                            {roomNameById.get(latestBooking.roomId) ?? "Unknown room"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t("No stays yet")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(guest)}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">{t("Edit")} {guest.fullName}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? t("Edit guest") : t("New guest")}</DialogTitle>
            <DialogDescription>
              {t("Guest details are saved to the PostgreSQL database.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">{t("Full name")}</Label>
              <Input
                id="fullName"
                value={draft.fullName}
                placeholder={t("Guest full name")}
                onChange={(event) => updateDraft("fullName", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("Phone")}</Label>
              <Input
                id="phone"
                value={draft.phone}
                placeholder="+212 600 000 000"
                onChange={(event) => updateDraft("phone", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("Email")}</Label>
              <Input
                id="email"
                type="email"
                value={draft.email}
                placeholder="guest@example.com"
                onChange={(event) => updateDraft("email", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">{t("Nationality")}</Label>
              <Input
                id="nationality"
                value={draft.nationality}
                placeholder="Morocco"
                onChange={(event) =>
                  updateDraft("nationality", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">{t("ID / Passport number")}</Label>
              <Input
                id="documentNumber"
                value={draft.documentNumber}
                placeholder="Passport or CIN"
                onChange={(event) =>
                  updateDraft("documentNumber", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
              <Textarea
                id="notes"
                value={draft.notes}
                placeholder={t("Preferences, language, arrival notes")}
                onChange={(event) => updateDraft("notes", event.target.value)}
              />
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/30 p-3 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{t("Booking history")}</p>
                <Badge variant="outline">
                  {selectedGuestBookings.length} {t(selectedGuestBookings.length === 1 ? "booking" : "bookings")}
                </Badge>
              </div>
              {selectedGuestBookings.length > 0 ? (
                <div className="space-y-2">
                  {selectedGuestBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-1 rounded-md border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {roomNameById.get(booking.roomId) ?? t("Unknown room")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.checkIn} to {booking.checkOut} ·{" "}
                          {booking.source}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {formatMoney(booking.amount, booking.currency)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("No booking history yet.")}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              {t("Cancel")}
            </Button>
            <Button onClick={saveGuest} disabled={saving}>
              {saving ? t("Saving...") : t("Save guest")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
