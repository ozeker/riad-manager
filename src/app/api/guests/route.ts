import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type GuestPayload = {
  id?: string
  fullName?: string
  phone?: string
  email?: string
  nationality?: string
  documentNumber?: string
  notes?: string
}

function serializeGuest(guest: {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  nationality: string | null
  documentNumber: string | null
  notes: string | null
}) {
  return {
    id: guest.id,
    fullName: guest.fullName,
    phone: guest.phone ?? "",
    email: guest.email ?? "",
    nationality: guest.nationality ?? "",
    documentNumber: guest.documentNumber ?? "",
    notes: guest.notes ?? "",
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as GuestPayload
  const fullName = payload.fullName?.trim()

  if (!fullName) {
    return NextResponse.json({ message: "Guest name is required." }, { status: 400 })
  }

  const data = {
    fullName,
    phone: payload.phone?.trim() || null,
    email: payload.email?.trim() || null,
    nationality: payload.nationality?.trim() || null,
    documentNumber: payload.documentNumber?.trim() || null,
    notes: payload.notes?.trim() || null,
  }

  const guest = payload.id
    ? await prisma.guest.update({
        where: { id: payload.id },
        data,
      })
    : await prisma.guest.create({ data })

  return NextResponse.json(serializeGuest(guest))
}
