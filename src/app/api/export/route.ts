import { NextResponse } from "next/server"

import { isDateString } from "@/lib/api-validation"
import { toCsv, type CsvRow } from "@/lib/csv"
import {
  getBookings,
  getCashMovements,
  getGuests,
  getInvoices,
  getPayments,
  getRooms,
} from "@/lib/data"
import type { InvoiceLine } from "@/lib/types"

export const runtime = "nodejs"

const datasets = [
  "bookings",
  "guests",
  "payments",
  "invoices",
  "cash-movements",
] as const

type Dataset = (typeof datasets)[number]

const exportHeaders: Record<Dataset, string[]> = {
  bookings: [
    "id",
    "guest_id",
    "guest_name",
    "room_id",
    "room_name",
    "check_in",
    "check_out",
    "guests",
    "source",
    "status",
    "amount",
    "currency",
    "notes",
  ],
  guests: [
    "id",
    "full_name",
    "phone",
    "email",
    "nationality",
    "document_number",
    "notes",
  ],
  payments: [
    "id",
    "booking_id",
    "guest_name",
    "room_name",
    "payment_date",
    "method",
    "amount",
    "currency",
    "notes",
  ],
  invoices: [
    "id",
    "final_number",
    "booking_id",
    "guest_name",
    "room_name",
    "check_in",
    "check_out",
    "status",
    "issue_date",
    "finalized_at",
    "total",
    "currency",
    "lines",
  ],
  "cash-movements": [
    "id",
    "date",
    "type",
    "category",
    "amount",
    "currency",
    "notes",
  ],
}

type ExportFilters = {
  from?: string
  to?: string
}

function isDataset(value: string | null): value is Dataset {
  return datasets.includes(value as Dataset)
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function dateInRange(value: string, filters: ExportFilters) {
  if (filters.from && value < filters.from) return false
  if (filters.to && value > filters.to) return false
  return true
}

function invoiceLineSummary(lines: InvoiceLine[]) {
  return lines
    .map(
      (line) =>
        `${line.description} x ${line.quantity} @ ${line.unitPrice} = ${line.total}`
    )
    .join("; ")
}

async function getExportRows(
  dataset: Dataset,
  filters: ExportFilters
): Promise<CsvRow[]> {
  if (dataset === "bookings") {
    const [bookings, rooms] = await Promise.all([getBookings(), getRooms()])
    const roomById = new Map(rooms.map((room) => [room.id, room]))

    return bookings
      .filter((booking) => dateInRange(booking.checkIn, filters))
      .map((booking) => ({
        id: booking.id,
        guest_id: booking.guestId,
        guest_name: booking.guestName,
        room_id: booking.roomId,
        room_name: roomById.get(booking.roomId)?.name ?? "",
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests: booking.guests,
        source: booking.source,
        status: booking.status,
        amount: booking.amount,
        currency: booking.currency,
        notes: booking.notes,
      }))
  }

  if (dataset === "guests") {
    const guests = await getGuests()

    return guests.map((guest) => ({
      id: guest.id,
      full_name: guest.fullName,
      phone: guest.phone,
      email: guest.email,
      nationality: guest.nationality,
      document_number: guest.documentNumber,
      notes: guest.notes,
    }))
  }

  if (dataset === "payments") {
    const [payments, bookings, rooms] = await Promise.all([
      getPayments(),
      getBookings(),
      getRooms(),
    ])
    const bookingById = new Map(bookings.map((booking) => [booking.id, booking]))
    const roomById = new Map(rooms.map((room) => [room.id, room]))

    return payments.filter((payment) => dateInRange(payment.paymentDate, filters)).map((payment) => {
      const booking = bookingById.get(payment.bookingId)

      return {
        id: payment.id,
        booking_id: payment.bookingId,
        guest_name: payment.guestName,
        room_name: booking ? roomById.get(booking.roomId)?.name ?? "" : "",
        payment_date: payment.paymentDate,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        notes: payment.notes,
      }
    })
  }

  if (dataset === "invoices") {
    const invoices = await getInvoices()

    return invoices.filter((invoice) => dateInRange(invoice.issueDate, filters)).map((invoice) => ({
      id: invoice.id,
      final_number: invoice.finalNumber,
      booking_id: invoice.bookingId,
      guest_name: invoice.guestName,
      room_name: invoice.roomName,
      check_in: invoice.checkIn,
      check_out: invoice.checkOut,
      status: invoice.status,
      issue_date: invoice.issueDate,
      finalized_at: invoice.finalizedAt,
      total: invoice.total,
      currency: invoice.currency,
      lines: invoiceLineSummary(invoice.lines),
    }))
  }

  const movements = await getCashMovements()

  return movements.filter((movement) => dateInRange(movement.date, filters)).map((movement) => ({
    id: movement.id,
    date: movement.date,
    type: movement.type,
    category: movement.category,
    amount: movement.amount,
    currency: movement.currency,
    notes: movement.notes,
  }))
}

function getFilters(searchParams: URLSearchParams): ExportFilters {
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  return {
    from: from && isDateString(from) ? from : undefined,
    to: to && isDateString(to) ? to : undefined,
  }
}

function getFilename(dataset: Dataset, filters: ExportFilters) {
  const range =
    filters.from || filters.to
      ? `${filters.from ?? "start"}-to-${filters.to ?? "today"}`
      : todayString()

  return `riad-manager-${dataset}-${range}.csv`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dataset = searchParams.get("dataset")

  if (!isDataset(dataset)) {
    return NextResponse.json(
      { message: "Choose a valid export dataset." },
      { status: 400 }
    )
  }

  const filters = getFilters(searchParams)
  const rows = await getExportRows(dataset, filters)
  const csv = toCsv(rows, exportHeaders[dataset])
  const filename = getFilename(dataset, filters)

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
