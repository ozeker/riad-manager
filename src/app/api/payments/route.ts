import { NextResponse } from "next/server"

import {
  dateFromString,
  integerValue,
  isCurrency,
  isDateString,
  isMissingRecordError,
  isPaymentMethod,
  jsonError,
  optionalCleanText,
  readJsonBody,
} from "@/lib/api-validation"
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

export async function POST(request: Request) {
  const body = await readJsonBody<PaymentPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const amount = integerValue(payload.amount)

  if (
    !payload.bookingId ||
    !isCurrency(payload.currency) ||
    !isPaymentMethod(payload.method) ||
    !isDateString(payload.paymentDate) ||
    amount === null ||
    amount <= 0
  ) {
    return jsonError("Booking, amount, currency, method, and date are required.")
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  })

  if (!booking) {
    return NextResponse.json({ message: "Booking not found." }, { status: 404 })
  }

  const data = {
    bookingId: payload.bookingId,
    amount,
    currency: payload.currency,
    method: payload.method,
    paymentDate: dateFromString(payload.paymentDate),
    notes: optionalCleanText(payload.notes),
  }

  try {
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
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Payment not found.", 404)
    }

    throw error
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return jsonError("Payment id is required.")
  }

  try {
    await prisma.payment.delete({ where: { id } })
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Payment not found.", 404)
    }

    throw error
  }

  return NextResponse.json({ ok: true })
}
