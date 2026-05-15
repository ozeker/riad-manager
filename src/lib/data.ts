import { prisma } from "@/lib/prisma"
import type {
  Booking,
  CashMovement,
  Currency,
  Guest,
  Invoice,
  Payment,
  Room,
} from "@/lib/types"

type BookingWithGuest = {
  id: string
  guest: { fullName: string }
  roomId: string
  checkIn: Date
  checkOut: Date
  guests: number
  source: string
  amount: number
  currency: string
  status: string
  notes: string | null
}

function dateString(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function serializeBooking(booking: BookingWithGuest): Booking {
  return {
    id: booking.id,
    guestName: booking.guest.fullName,
    roomId: booking.roomId,
    checkIn: dateString(booking.checkIn),
    checkOut: dateString(booking.checkOut),
    guests: booking.guests,
    source: booking.source as Booking["source"],
    amount: booking.amount,
    currency: booking.currency as Currency,
    status: booking.status as Booking["status"],
    notes: booking.notes ?? "",
  }
}

export async function getProperty() {
  return prisma.property.findFirst()
}

export async function getRooms(options?: { activeOnly?: boolean }): Promise<Room[]> {
  const rows = await prisma.room.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: { createdAt: "asc" },
  })

  return rows.map((room) => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    rates: {
      MAD: room.rateMad,
      EUR: room.rateEur,
      USD: room.rateUsd,
    },
    active: room.active,
  }))
}

export async function getBookings(): Promise<Booking[]> {
  const rows = await prisma.booking.findMany({
    where: { deletedAt: null },
    include: { guest: true },
    orderBy: { checkIn: "asc" },
  })

  return rows.map(serializeBooking)
}

export async function getGuests(): Promise<Guest[]> {
  const rows = await prisma.guest.findMany({
    orderBy: { fullName: "asc" },
  })

  return rows.map((guest) => ({
    id: guest.id,
    fullName: guest.fullName,
    phone: guest.phone ?? "",
    email: guest.email ?? "",
    nationality: guest.nationality ?? "",
    documentNumber: guest.documentNumber ?? "",
    notes: guest.notes ?? "",
  }))
}

export async function getPayments(): Promise<Payment[]> {
  const rows = await prisma.payment.findMany({
    include: { booking: { include: { guest: true } } },
    orderBy: { paymentDate: "desc" },
  })

  return rows.map((payment) => ({
    id: payment.id,
    bookingId: payment.bookingId,
    guestName: payment.booking.guest.fullName,
    amount: payment.amount,
    currency: payment.currency as Currency,
    method: payment.method as Payment["method"],
    paymentDate: dateString(payment.paymentDate),
    notes: payment.notes ?? "",
  }))
}

export async function getCashMovements(): Promise<CashMovement[]> {
  const rows = await prisma.cashMovement.findMany({
    orderBy: { date: "asc" },
  })

  return rows.map((movement) => ({
    id: movement.id,
    date: dateString(movement.date),
    type: movement.type as CashMovement["type"],
    category: movement.category,
    amount: movement.amount,
    currency: "MAD",
    notes: movement.notes ?? "",
  }))
}

export async function getInvoices(): Promise<Invoice[]> {
  const rows = await prisma.invoice.findMany({
    include: { booking: { include: { guest: true } } },
    orderBy: { issueDate: "desc" },
  })

  return rows.map((invoice) => ({
    id: invoice.id,
    bookingId: invoice.bookingId,
    guestName: invoice.booking.guest.fullName,
    status: invoice.status as Invoice["status"],
    total: invoice.total,
    currency: invoice.currency as Currency,
    issueDate: dateString(invoice.issueDate),
  }))
}
