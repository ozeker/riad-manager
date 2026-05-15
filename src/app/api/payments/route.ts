import { NextResponse } from "next/server"

import { serializePayment } from "@/lib/data"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type PaymentPayload = {
  id?: string
  bookingId?: string
  amount?: number
  currency?: string
  method?: string
  paymentDate?: string
  notes?: string
}

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export async function POST(request: Request) {
  const payload = (await request.json()) as PaymentPayload
  const amount = Number(payload.amount)

  if (
    !payload.bookingId ||
    !payload.currency ||
    !payload.method ||
    !payload.paymentDate ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return NextResponse.json(
      { message: "Booking, amount, currency, method, and date are required." },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  })

  if (!booking) {
    return NextResponse.json({ message: "Booking not found." }, { status: 404 })
  }

  const data = {
    bookingId: payload.bookingId,
    amount: Math.round(amount),
    currency: payload.currency,
    method: payload.method,
    paymentDate: date(payload.paymentDate),
    notes: payload.notes?.trim() || null,
  }

  const payment = payload.id
    ? await prisma.payment.update({
        where: { id: payload.id },
        data,
        include: { booking: { include: { guest: true } } },
      })
    : await prisma.payment.create({
        data,
        include: { booking: { include: { guest: true } } },
      })

  return NextResponse.json(serializePayment(payment))
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ message: "Payment id is required." }, { status: 400 })
  }

  await prisma.payment.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
