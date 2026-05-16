import { prisma } from "@/lib/prisma"
import type {
  Booking,
  CashMovement,
  Currency,
  Guest,
  IcalFeed,
  Invoice,
  Payment,
  Property,
  Room,
} from "@/lib/types"

type BookingWithGuest = {
  id: string
  guestId: string
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

type PaymentWithBooking = {
  id: string
  bookingId: string
  booking: { guest: { fullName: string } }
  amount: number
  currency: string
  method: string
  paymentDate: Date
  notes: string | null
}

type CashMovementRow = {
  id: string
  date: Date
  type: string
  category: string
  amount: number
  currency: string
  notes: string | null
}

type IcalFeedRow = {
  id: string
  name: string
  source: string
  roomId: string | null
  room: { name: string } | null
  url: string
  active: boolean
  lastSyncedAt: Date | null
  lastImportStatus: string | null
  lastImportMessage: string | null
  lastImportImported: number
  lastImportUpdated: number
  lastImportSkipped: number
  lastImportErrors: number
}

type InvoiceWithBooking = {
  id: string
  finalNumber: string | null
  bookingId: string
  booking: {
    guest: { fullName: string }
    room: { name: string }
    checkIn: Date
    checkOut: Date
  }
  status: string
  finalizedAt: Date | null
  issueDate: Date
  total: number
  currency: string
  lines: {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
}

type PropertyRow = {
  id: string
  name: string
  legalName: string
  city: string
  country: string
  phone: string
  ice: string
  defaultCurrency: string
  touristTaxMadPerPersonNight: number
  vatRatePercent: number
}

function dateString(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function serializeBooking(booking: BookingWithGuest): Booking {
  return {
    id: booking.id,
    guestId: booking.guestId,
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

export function serializePayment(payment: PaymentWithBooking): Payment {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    guestName: payment.booking.guest.fullName,
    amount: payment.amount,
    currency: payment.currency as Currency,
    method: payment.method as Payment["method"],
    paymentDate: dateString(payment.paymentDate),
    notes: payment.notes ?? "",
  }
}

export function serializeCashMovement(movement: CashMovementRow): CashMovement {
  return {
    id: movement.id,
    date: dateString(movement.date),
    type: movement.type as CashMovement["type"],
    category: movement.category,
    amount: movement.amount,
    currency: "MAD",
    notes: movement.notes ?? "",
  }
}

export function serializeIcalFeed(feed: IcalFeedRow): IcalFeed {
  return {
    id: feed.id,
    name: feed.name,
    source: feed.source as IcalFeed["source"],
    roomId: feed.roomId ?? "",
    roomName: feed.room?.name ?? "",
    url: feed.url,
    active: feed.active,
    lastSyncedAt: feed.lastSyncedAt ? feed.lastSyncedAt.toISOString() : "",
    lastImportStatus: (feed.lastImportStatus ?? "") as IcalFeed["lastImportStatus"],
    lastImportMessage: feed.lastImportMessage ?? "",
    lastImportImported: feed.lastImportImported,
    lastImportUpdated: feed.lastImportUpdated,
    lastImportSkipped: feed.lastImportSkipped,
    lastImportErrors: feed.lastImportErrors,
  }
}

export function serializeInvoice(invoice: InvoiceWithBooking): Invoice {
  return {
    id: invoice.id,
    finalNumber: invoice.finalNumber ?? "",
    bookingId: invoice.bookingId,
    guestName: invoice.booking.guest.fullName,
    roomName: invoice.booking.room.name,
    checkIn: dateString(invoice.booking.checkIn),
    checkOut: dateString(invoice.booking.checkOut),
    status: invoice.status as Invoice["status"],
    total: invoice.total,
    currency: invoice.currency as Currency,
    issueDate: dateString(invoice.issueDate),
    finalizedAt: invoice.finalizedAt ? invoice.finalizedAt.toISOString() : "",
    lines: invoice.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      total: line.total,
    })),
  }
}

export function serializeProperty(property: PropertyRow): Property {
  return {
    id: property.id,
    name: property.name,
    legalName: property.legalName,
    city: property.city,
    country: property.country,
    phone: property.phone,
    ice: property.ice,
    defaultCurrency: property.defaultCurrency as Currency,
    touristTaxMadPerPersonNight: property.touristTaxMadPerPersonNight,
    vatRatePercent: property.vatRatePercent,
  }
}

export async function getProperty(): Promise<Property | null> {
  const property = await prisma.property.findFirst()
  return property ? serializeProperty(property) : null
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

  return rows.map(serializePayment)
}

export async function getCashMovements(): Promise<CashMovement[]> {
  const rows = await prisma.cashMovement.findMany({
    orderBy: { date: "asc" },
  })

  return rows.map(serializeCashMovement)
}

export async function getIcalFeeds(): Promise<IcalFeed[]> {
  const rows = await prisma.icalFeed.findMany({
    include: { room: true },
    orderBy: { createdAt: "asc" },
  })

  return rows.map(serializeIcalFeed)
}

export async function getInvoices(): Promise<Invoice[]> {
  const rows = await prisma.invoice.findMany({
    include: {
      booking: { include: { guest: true, room: true } },
      lines: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { issueDate: "desc" },
  })

  return rows.map(serializeInvoice)
}
