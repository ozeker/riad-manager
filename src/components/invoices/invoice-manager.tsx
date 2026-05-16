"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { Separator } from "@/components/ui/separator"
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
import { formatMoney } from "@/lib/format"
import type { Booking, Currency, Invoice, InvoiceLine, Room } from "@/lib/types"

type InvoiceLineDraft = Omit<InvoiceLine, "id"> & {
  id?: string
}

type InvoiceDraft = {
  id?: string
  bookingId: string
  issueDate: string
  status: Invoice["status"]
  lines: InvoiceLineDraft[]
}

type InvoiceManagerProps = {
  invoices: Invoice[]
  bookings: Booking[]
  rooms: Room[]
  touristTaxMadPerPersonNight: number
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function tempId() {
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function dateValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = dateValue(checkOut).getTime() - dateValue(checkIn).getTime()
  return Math.max(1, Math.round(diff / 86_400_000))
}

function lineTotal(line: Pick<InvoiceLineDraft, "quantity" | "unitPrice">) {
  return Math.max(0, Math.round(Number(line.quantity) || 0)) *
    Math.max(0, Math.round(Number(line.unitPrice) || 0))
}

function getInvoiceTotal(lines: InvoiceLineDraft[]) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0)
}

function getBookingLabel(booking: Booking, rooms: Room[]) {
  const room = rooms.find((item) => item.id === booking.roomId)
  return `${booking.guestName} - ${room?.name ?? "Unknown room"} - ${booking.checkIn}`
}

function buildDefaultLines(
  booking: Booking,
  touristTaxMadPerPersonNight: number
): InvoiceLineDraft[] {
  const nights = nightsBetween(booking.checkIn, booking.checkOut)
  const lines: InvoiceLineDraft[] = [
    {
      id: `${booking.id}-room-stay`,
      description: `Room stay - ${nights} night${nights === 1 ? "" : "s"}`,
      quantity: 1,
      unitPrice: booking.amount,
      total: booking.amount,
    },
  ]

  if (booking.currency === "MAD" && touristTaxMadPerPersonNight > 0) {
    const quantity = booking.guests * nights
    lines.push({
      id: `${booking.id}-tourist-tax`,
      description: "Tourist tax",
      quantity,
      unitPrice: touristTaxMadPerPersonNight,
      total: quantity * touristTaxMadPerPersonNight,
    })
  }

  return lines
}

function createEmptyInvoice(
  booking: Booking | undefined,
  touristTaxMadPerPersonNight: number
): InvoiceDraft {
  return {
    bookingId: booking?.id ?? "",
    issueDate: booking?.checkIn ?? todayString(),
    status: "draft",
    lines: booking ? buildDefaultLines(booking, touristTaxMadPerPersonNight) : [],
  }
}

function getInvoiceCurrency(draft: InvoiceDraft, bookings: Booking[]): Currency {
  return (
    bookings.find((booking) => booking.id === draft.bookingId)?.currency ?? "MAD"
  )
}

function getTotalsByCurrency(invoices: Invoice[]) {
  return (["MAD", "EUR", "USD"] as Currency[]).map((currency) => ({
    currency,
    total: invoices
      .filter((invoice) => invoice.currency === currency)
      .reduce((sum, invoice) => sum + invoice.total, 0),
  }))
}

export function InvoiceManager({
  invoices: initialInvoices,
  bookings,
  rooms,
  touristTaxMadPerPersonNight,
}: InvoiceManagerProps) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [draft, setDraft] = useState<InvoiceDraft>(() =>
    createEmptyInvoice(
      bookings.find(
        (booking) =>
          !initialInvoices.some((invoice) => invoice.bookingId === booking.id)
      ),
      touristTaxMadPerPersonNight
    )
  )
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const invoiceBookingIds = useMemo(
    () => new Set(invoices.map((invoice) => invoice.bookingId)),
    [invoices]
  )
  const availableBookings = useMemo(
    () => bookings.filter((booking) => !invoiceBookingIds.has(booking.id)),
    [bookings, invoiceBookingIds]
  )
  const bookingById = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings]
  )
  const totals = useMemo(() => getTotalsByCurrency(invoices), [invoices])
  const draftCurrency = getInvoiceCurrency(draft, bookings)
  const draftTotal = getInvoiceTotal(draft.lines)

  function openCreate() {
    setDraft(createEmptyInvoice(availableBookings[0], touristTaxMadPerPersonNight))
    setOpen(true)
  }

  function openEdit(invoice: Invoice) {
    setDraft({
      id: invoice.id,
      bookingId: invoice.bookingId,
      issueDate: invoice.issueDate,
      status: invoice.status,
      lines: invoice.lines,
    })
    setOpen(true)
  }

  function updateDraft<K extends keyof InvoiceDraft>(
    key: K,
    value: InvoiceDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateLine<K extends keyof InvoiceLineDraft>(
    index: number,
    key: K,
    value: InvoiceLineDraft[K]
  ) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => {
        if (lineIndex !== index) {
          return line
        }

        const updatedLine = { ...line, [key]: value }
        return {
          ...updatedLine,
          total: lineTotal(updatedLine),
        }
      }),
    }))
  }

  function addLine() {
    setDraft((current) => ({
      ...current,
      lines: [
        ...current.lines,
        {
          id: tempId(),
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    }))
  }

  function removeLine(index: number) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.filter((_, lineIndex) => lineIndex !== index),
    }))
  }

  function changeBooking(bookingId: string) {
    const booking = bookingById.get(bookingId)
    setDraft((current) => ({
      ...createEmptyInvoice(booking, touristTaxMadPerPersonNight),
      id: current.id,
      bookingId,
    }))
  }

  async function saveInvoice() {
    if (!draft.bookingId) {
      toast.error("Choose a booking before saving.")
      return
    }

    const validLines = draft.lines.filter((line) => line.description.trim())

    if (validLines.length === 0) {
      toast.error("Add at least one invoice line.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draft,
          lines: validLines,
        }),
      })

      if (!response.ok) {
        throw new Error("Could not save invoice.")
      }

      const savedInvoice = (await response.json()) as Invoice

      setInvoices((current) => {
        const exists = current.some((invoice) => invoice.id === savedInvoice.id)
        if (exists) {
          return current.map((invoice) =>
            invoice.id === savedInvoice.id ? savedInvoice : invoice
          )
        }

        return [savedInvoice, ...current]
      })

      toast.success(draft.id ? "Invoice draft updated" : "Invoice draft created")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("The invoice draft could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteInvoice(invoice: Invoice) {
    setDeletingId(invoice.id)
    try {
      const response = await fetch(`/api/invoices?id=${invoice.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Could not delete invoice.")
      }

      setInvoices((current) =>
        current.filter((item) => item.id !== invoice.id)
      )
      toast.success("Invoice draft deleted")
      router.refresh()
    } catch {
      toast.error("The invoice draft could not be deleted.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Draft invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {invoices.length}
            </p>
          </CardContent>
        </Card>
        {totals.map(({ currency, total }) => (
          <Card key={currency} className="rounded-lg border-border/80 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {currency} total
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
        <Button onClick={openCreate} disabled={availableBookings.length === 0}>
          <Plus className="size-4" />
          Draft invoice
        </Button>
      </div>

      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Stay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.guestName}</div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.roomName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.checkIn} to {invoice.checkOut}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">
                            Invoice actions for {invoice.guestName}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(invoice)}>
                          <Pencil className="size-4" />
                          Edit draft
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteInvoice(invoice)}
                          disabled={deletingId === invoice.id}
                        >
                          <Trash2 className="size-4" />
                          {deletingId === invoice.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No invoice drafts yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {draft.id ? "Edit invoice draft" : "Draft invoice"}
            </DialogTitle>
            <DialogDescription>
              Drafts stay editable. PDF generation and final invoice numbering
              come in a later step.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Booking</Label>
              <Select
                value={draft.bookingId}
                onValueChange={changeBooking}
                disabled={Boolean(draft.id)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem
                      key={booking.id}
                      value={booking.id}
                      disabled={
                        invoiceBookingIds.has(booking.id) &&
                        booking.id !== draft.bookingId
                      }
                    >
                      {getBookingLabel(booking, rooms)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue date</Label>
              <Input
                id="issueDate"
                type="date"
                value={draft.issueDate}
                onChange={(event) =>
                  updateDraft("issueDate", event.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Invoice lines</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="size-4" />
                Line
              </Button>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-64">Description</TableHead>
                    <TableHead className="w-28">Qty</TableHead>
                    <TableHead className="w-36">Unit price</TableHead>
                    <TableHead className="w-36 text-right">Line total</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draft.lines.map((line, index) => (
                    <TableRow key={line.id ?? index}>
                      <TableCell>
                        <Input
                          value={line.description}
                          placeholder="Room stay"
                          onChange={(event) =>
                            updateLine(index, "description", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(
                              index,
                              "quantity",
                              Number(event.target.value)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={line.unitPrice}
                          onChange={(event) =>
                            updateLine(
                              index,
                              "unitPrice",
                              Number(event.target.value)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(lineTotal(line), draftCurrency)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(index)}
                          disabled={draft.lines.length === 1}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Remove line</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-md bg-muted/50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Currency follows the selected booking.
            </span>
            <span className="text-lg font-semibold">
              Total: {formatMoney(draftTotal, draftCurrency)}
            </span>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={saveInvoice} disabled={saving}>
              {saving ? "Saving..." : "Save draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
