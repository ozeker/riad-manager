"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useLanguage } from "@/components/i18n/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { Booking, Currency, Payment, Room } from "@/lib/types"

type PaymentDraft = Omit<Payment, "id" | "guestName"> & {
  id?: string
  guestName?: string
}

type PaymentManagerProps = {
  payments: Payment[]
  bookings: Booking[]
  rooms: Room[]
}

const currencies: Currency[] = ["MAD", "EUR", "USD"]

const methods: Payment["method"][] = [
  "cash",
  "card",
  "bank transfer",
  "OTA prepaid",
  "other",
]

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function createEmptyPayment(bookings: Booking[]): PaymentDraft {
  const booking = bookings[0]

  return {
    bookingId: booking?.id ?? "",
    guestName: booking?.guestName ?? "",
    amount: booking?.amount ?? 0,
    currency: booking?.currency ?? "MAD",
    method: "cash",
    paymentDate: todayString(),
    notes: "",
  }
}

function getTotals(payments: Payment[]) {
  return currencies.map((currency) => ({
    currency,
    total: payments
      .filter((payment) => payment.currency === currency)
      .reduce((sum, payment) => sum + payment.amount, 0),
  }))
}

function getBookingLabel(booking: Booking, rooms: Room[]) {
  const room = rooms.find((item) => item.id === booking.roomId)
  return `${booking.guestName} · ${room?.name ?? "Unknown room"} · ${booking.checkIn}`
}

export function PaymentManager({
  payments: initialPayments,
  bookings,
  rooms,
}: PaymentManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [payments, setPayments] = useState(initialPayments)
  const [draft, setDraft] = useState<PaymentDraft>(() =>
    createEmptyPayment(bookings)
  )
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totals = useMemo(() => getTotals(payments), [payments])
  const bookingById = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings]
  )

  function openCreate() {
    setDraft(createEmptyPayment(bookings))
    setOpen(true)
  }

  function openEdit(payment: Payment) {
    setDraft(payment)
    setOpen(true)
  }

  function updateDraft<K extends keyof PaymentDraft>(
    key: K,
    value: PaymentDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function savePayment() {
    if (!draft.bookingId) {
      toast.error(t("Choose a booking before saving."))
      return
    }

    if (!draft.amount || Number(draft.amount) <= 0) {
      toast.error(t("Payment amount must be greater than zero."))
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        throw new Error(t("Could not save payment."))
      }

      const savedPayment = (await response.json()) as Payment

      setPayments((current) => {
        const exists = current.some((payment) => payment.id === savedPayment.id)
        if (exists) {
          return current.map((payment) =>
            payment.id === savedPayment.id ? savedPayment : payment
          )
        }

        return [savedPayment, ...current]
      })

      toast.success(draft.id ? t("Payment updated") : t("Payment recorded"))
      setOpen(false)
      router.refresh()
    } catch {
      toast.error(t("The payment could not be saved."))
    } finally {
      setSaving(false)
    }
  }

  async function deletePayment(payment: Payment) {
    setDeletingId(payment.id)
    try {
      const response = await fetch(`/api/payments?id=${payment.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("Could not delete payment."))
      }

      setPayments((current) =>
        current.filter((item) => item.id !== payment.id)
      )
      toast.success(t("Payment deleted"))
      router.refresh()
    } catch {
      toast.error(t("The payment could not be deleted."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        {totals.map(({ currency, total }) => (
          <Card key={currency} className="rounded-lg border-border/80 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {currency} {t("collected")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">
                {formatMoney(total, currency)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate} disabled={bookings.length === 0}>
          <Plus className="size-4" />
          {t("Record payment")}
        </Button>
      </div>

      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Guest")}</TableHead>
                <TableHead>{t("Booking")}</TableHead>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Method")}</TableHead>
                <TableHead>{t("Notes")}</TableHead>
                <TableHead className="text-right">{t("Amount")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const booking = bookingById.get(payment.bookingId)

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.guestName}
                    </TableCell>
                    <TableCell>
                      {booking ? getBookingLabel(booking, rooms) : t("Unknown booking")}
                    </TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(payment.method)}</Badge>
                    </TableCell>
                    <TableCell>{payment.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">
                              Payment actions for {payment.guestName}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(payment)}>
                            <Pencil className="size-4" />
                            {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deletePayment(payment)}
                            disabled={deletingId === payment.id}
                          >
                            <Trash2 className="size-4" />
                            {deletingId === payment.id ? t("Deleting...") : t("Delete")}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? t("Edit payment") : t("Record payment")}
            </DialogTitle>
            <DialogDescription>
              {t("Payments are saved to the PostgreSQL database and update booking payment status.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("Booking")}</Label>
              <Select
                value={draft.bookingId}
                onValueChange={(bookingId) => {
                  const booking = bookingById.get(bookingId)
                  updateDraft("bookingId", bookingId)
                  if (booking) {
                    updateDraft("currency", booking.currency)
                    updateDraft("guestName", booking.guestName)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Choose booking")} />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {getBookingLabel(booking, rooms)}
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
                min="1"
                value={draft.amount}
                onChange={(event) =>
                  updateDraft("amount", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Currency")}</Label>
              <Select
                value={draft.currency}
                onValueChange={(currency: Currency) =>
                  updateDraft("currency", currency)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Currency")} />
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

            <div className="space-y-2">
              <Label>{t("Method")}</Label>
              <Select
                value={draft.method}
                onValueChange={(method: Payment["method"]) =>
                  updateDraft("method", method)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Method")} />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {t(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">{t("Payment date")}</Label>
              <Input
                id="paymentDate"
                type="date"
                value={draft.paymentDate}
                onChange={(event) =>
                  updateDraft("paymentDate", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
              <Textarea
                id="notes"
                value={draft.notes}
                placeholder={t("Cash received, card terminal reference, OTA payout note")}
                onChange={(event) => updateDraft("notes", event.target.value)}
              />
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
            <Button onClick={savePayment} disabled={saving}>
              {saving ? t("Saving...") : t("Save payment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
