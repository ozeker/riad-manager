import { randomUUID } from "crypto"

import { NextResponse } from "next/server"

import {
  cleanText,
  dateFromString,
  integerValue,
  isDateString,
  isMissingRecordError,
  jsonError,
  readJsonBody,
} from "@/lib/api-validation"
import { serializeInvoice } from "@/lib/data"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type InvoiceLinePayload = {
  id?: string
  description?: string
  quantity?: number
  unitPrice?: number
}

type InvoicePayload = {
  id?: string
  bookingId?: string
  issueDate?: string
  status?: string
  lines?: InvoiceLinePayload[]
}

function invoiceId() {
  return `INV-DRAFT-${randomUUID().slice(0, 8).toUpperCase()}`
}

function normalizeLines(lines: InvoiceLinePayload[] | undefined) {
  return (lines ?? [])
    .map((line) => {
      const description = cleanText(line.description)
      const quantity = Math.max(1, integerValue(line.quantity) ?? 0)
      const unitPrice = Math.max(0, integerValue(line.unitPrice) ?? 0)

      return {
        description,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      }
    })
    .filter((line) => line.description.length > 0)
}

export async function POST(request: Request) {
  const body = await readJsonBody<InvoicePayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const lines = normalizeLines(payload.lines)

  if (!payload.bookingId || !isDateString(payload.issueDate) || lines.length === 0) {
    return jsonError(
      "Booking, issue date, and at least one invoice line are required."
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
  })

  if (!booking || booking.deletedAt) {
    return NextResponse.json({ message: "Booking not found." }, { status: 404 })
  }

  const existingInvoice = await prisma.invoice.findUnique({
    where: { bookingId: payload.bookingId },
  })

  if (existingInvoice && existingInvoice.id !== payload.id) {
    return NextResponse.json(
      { message: "This booking already has an invoice draft." },
      { status: 409 }
    )
  }

  const total = lines.reduce((sum, line) => sum + line.total, 0)
  const data = {
    bookingId: payload.bookingId,
    status: "draft",
    issueDate: dateFromString(payload.issueDate),
    total,
    currency: booking.currency,
  }

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      const savedInvoice = payload.id
        ? await tx.invoice.update({
            where: { id: payload.id },
            data,
          })
        : await tx.invoice.create({
            data: {
              id: invoiceId(),
              ...data,
            },
          })

      await tx.invoiceLine.deleteMany({
        where: { invoiceId: savedInvoice.id },
      })

      await tx.invoiceLine.createMany({
        data: lines.map((line) => ({
          invoiceId: savedInvoice.id,
          ...line,
        })),
      })

      return tx.invoice.findUniqueOrThrow({
        where: { id: savedInvoice.id },
        include: {
          booking: { include: { guest: true, room: true } },
          lines: { orderBy: { createdAt: "asc" } },
        },
      })
    })

    return NextResponse.json(serializeInvoice(invoice))
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Invoice not found.", 404)
    }

    throw error
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return jsonError("Invoice id is required.")
  }

  try {
    await prisma.$transaction([
      prisma.invoiceLine.deleteMany({ where: { invoiceId: id } }),
      prisma.invoice.delete({ where: { id } }),
    ])
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Invoice not found.", 404)
    }

    throw error
  }

  return NextResponse.json({ ok: true })
}
