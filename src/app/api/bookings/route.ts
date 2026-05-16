import { NextResponse } from "next/server"

import {
  cleanText,
  dateFromString,
  integerValue,
  isBookingSource,
  isBookingStatus,
  isCurrency,
  isDateString,
  isMissingRecordError,
  jsonError,
  optionalCleanText,
  readJsonBody,
} from "@/lib/api-validation"
import { prisma } from "@/lib/prisma"
import { serializeBooking } from "@/lib/data"

export const runtime = "nodejs"

type BookingPayload = {
  id?: string
  guestId?: string
  guestName?: string
  roomId?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  source?: string
  amount?: number
  currency?: string
  status?: string
  notes?: string
}

export async function POST(request: Request) {
  const body = await readJsonBody<BookingPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const guestName = cleanText(payload.guestName)
  const guests = integerValue(payload.guests) ?? 1
  const amount = integerValue(payload.amount) ?? 0
  if (
    (!payload.guestId && !guestName) ||
    !payload.roomId ||
    !isDateString(payload.checkIn) ||
    !isDateString(payload.checkOut) ||
    !isBookingSource(payload.source) ||
    !isCurrency(payload.currency) ||
    !isBookingStatus(payload.status)
  ) {
    return jsonError("Missing required booking fields.")
  }

  if (payload.checkIn >= payload.checkOut) {
    return jsonError("Check-out must be after check-in.")
  }

  if (guests < 1 || amount < 0) {
    return jsonError("Guests and amount must be valid numbers.")
  }

  const room = await prisma.room.findUnique({ where: { id: payload.roomId } })

  if (!room) {
    return jsonError("Room not found.", 404)
  }

  if (!room.active) {
    return jsonError("Inactive rooms cannot receive new bookings.")
  }

  if (guests > room.capacity) {
    return jsonError(`This room capacity is ${room.capacity} guests.`)
  }

  const guest = payload.guestId
    ? await prisma.guest.findUnique({ where: { id: payload.guestId } })
    : (await prisma.guest.findFirst({
        where: { fullName: guestName },
      })) ??
      (await prisma.guest.create({
        data: {
          fullName: guestName,
          notes: "Created from booking form.",
        },
      }))

  if (!guest) {
    return NextResponse.json({ message: "Guest not found." }, { status: 404 })
  }

  const data = {
    guestId: guest.id,
    roomId: payload.roomId,
    checkIn: dateFromString(payload.checkIn),
    checkOut: dateFromString(payload.checkOut),
    guests,
    source: payload.source,
    amount,
    currency: payload.currency,
    status: payload.status,
    notes: optionalCleanText(payload.notes),
  }

  try {
    const booking = payload.id
      ? await prisma.booking.update({
          where: { id: payload.id },
          data,
          include: { guest: true },
        })
      : await prisma.booking.create({
          data,
          include: { guest: true },
        })

    return NextResponse.json(serializeBooking(booking))
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Booking not found.", 404)
    }

    throw error
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return jsonError("Booking id is required.")
  }

  try {
    await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        deletedAt: new Date(),
      },
    })
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Booking not found.", 404)
    }

    throw error
  }

  return NextResponse.json({ ok: true })
}
