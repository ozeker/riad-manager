import { NextResponse } from "next/server"

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

function isDataset(value: string | null): value is Dataset {
  return datasets.includes(value as Dataset)
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function invoiceLineSummary(lines: InvoiceLine[]) {
  return lines
    .map(
      (line) =>
        `${line.description} x ${line.quantity} @ ${line.unitPrice} = ${line.total}`
    )
    .join("; ")
}

async function getExportRows(dataset: Dataset): Promise<CsvRow[]> {
  if (dataset === "bookings") {
    const [bookings, rooms] = await Promise.all([getBookings(), getRooms()])
    const roomById = new Map(rooms.map((room) => [room.id, room]))

    return bookings.map((booking) => ({
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

    return payments.map((payment) => {
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

    return invoices.map((invoice) => ({
      id: invoice.id,
      booking_id: invoice.bookingId,
      guest_name: invoice.guestName,
      room_name: invoice.roomName,
      check_in: invoice.checkIn,
      check_out: invoice.checkOut,
      status: invoice.status,
      issue_date: invoice.issueDate,
      total: invoice.total,
      currency: invoice.currency,
      lines: invoiceLineSummary(invoice.lines),
    }))
  }

  const movements = await getCashMovements()

  return movements.map((movement) => ({
    id: movement.id,
    date: movement.date,
    type: movement.type,
    category: movement.category,
    amount: movement.amount,
    currency: movement.currency,
    notes: movement.notes,
  }))
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

  const rows = await getExportRows(dataset)
  const csv = toCsv(rows)
  const filename = `riad-manager-${dataset}-${todayString()}.csv`

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
