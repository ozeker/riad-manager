import { NextResponse } from "next/server"

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

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export async function POST(request: Request) {
  const payload = (await request.json()) as BookingPayload

  if (
    (!payload.guestId && !payload.guestName) ||
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

  const guest = payload.guestId
    ? await prisma.guest.findUnique({ where: { id: payload.guestId } })
    : (await prisma.guest.findFirst({
        where: { fullName: payload.guestName },
      })) ??
      (await prisma.guest.create({
        data: {
          fullName: payload.guestName ?? "",
          notes: "Created from booking form.",
        },
      }))

  if (!guest) {
    return NextResponse.json({ message: "Guest not found." }, { status: 404 })
  }

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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ message: "Booking id is required." }, { status: 400 })
  }

  await prisma.booking.update({
    where: { id },
    data: {
      status: "cancelled",
      deletedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
