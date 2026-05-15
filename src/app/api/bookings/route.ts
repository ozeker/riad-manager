import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { serializeBooking } from "@/lib/data"

export const runtime = "nodejs"

type BookingPayload = {
  id?: string
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

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export async function POST(request: Request) {
  const payload = (await request.json()) as BookingPayload

  if (
    !payload.guestName ||
    !payload.roomId ||
    !payload.checkIn ||
    !payload.checkOut ||
    !payload.source ||
    !payload.currency ||
    !payload.status
  ) {
    return NextResponse.json(
      { message: "Missing required booking fields." },
      { status: 400 }
    )
  }

  const guest =
    (await prisma.guest.findFirst({
      where: { fullName: payload.guestName },
    })) ??
    (await prisma.guest.create({
      data: {
        fullName: payload.guestName,
        notes: "Created from calendar prototype.",
      },
    }))

  const data = {
    guestId: guest.id,
    roomId: payload.roomId,
    checkIn: date(payload.checkIn),
    checkOut: date(payload.checkOut),
    guests: Number(payload.guests) || 1,
    source: payload.source,
    amount: Number(payload.amount) || 0,
    currency: payload.currency,
    status: payload.status,
    notes: payload.notes ?? "",
  }

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
}
