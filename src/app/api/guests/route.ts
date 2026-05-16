import { NextResponse } from "next/server"

import {
  cleanText,
  isMissingRecordError,
  jsonError,
  optionalCleanText,
  readJsonBody,
} from "@/lib/api-validation"
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
  const body = await readJsonBody<GuestPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const fullName = cleanText(payload.fullName)

  if (!fullName) {
    return jsonError("Guest name is required.")
  }

  const data = {
    fullName,
    phone: optionalCleanText(payload.phone),
    email: optionalCleanText(payload.email),
    nationality: optionalCleanText(payload.nationality),
    documentNumber: optionalCleanText(payload.documentNumber),
    notes: optionalCleanText(payload.notes),
  }

  try {
    const guest = payload.id
      ? await prisma.guest.update({
          where: { id: payload.id },
          data,
        })
      : await prisma.guest.create({ data })

    return NextResponse.json(serializeGuest(guest))
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Guest not found.", 404)
    }

    throw error
  }
}
