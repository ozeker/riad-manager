import { NextResponse } from "next/server"

import { createInvoiceDraftPdf } from "@/lib/invoice-pdf"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { message: "Invoice id is required." },
      { status: 400 }
    )
  }

  const [invoice, property] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            guest: true,
            room: true,
          },
        },
        lines: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.property.findFirst(),
  ])

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found." }, { status: 404 })
  }

  const pdfBytes = await createInvoiceDraftPdf({
    id: invoice.id,
    finalNumber: invoice.finalNumber,
    status: invoice.status,
    finalizedAt: invoice.finalizedAt,
    issueDate: invoice.issueDate,
    total: invoice.total,
    currency: invoice.currency,
    property: {
      name: property?.name ?? "Riad Al Fes",
      legalName: property?.legalName ?? "Riad Al Fes SARL",
      address: property?.address ?? "23 Derb Zellij, Fes Medina",
      city: property?.city ?? "Fes",
      country: property?.country ?? "Morocco",
      phone: property?.phone ?? "+212 600 000 000",
      ice: property?.ice ?? "001234567000089",
      vatRatePercent: property?.vatRatePercent ?? 10,
    },
    booking: {
      checkIn: invoice.booking.checkIn,
      checkOut: invoice.booking.checkOut,
      guests: invoice.booking.guests,
      source: invoice.booking.source,
      guest: {
        fullName: invoice.booking.guest.fullName,
        phone: invoice.booking.guest.phone,
        email: invoice.booking.guest.email,
        nationality: invoice.booking.guest.nationality,
        documentNumber: invoice.booking.guest.documentNumber,
      },
      room: {
        name: invoice.booking.room.name,
      },
    },
    lines: invoice.lines,
  })

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Disposition": `attachment; filename="${invoice.finalNumber ?? invoice.id}.pdf"`,
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  })
}
