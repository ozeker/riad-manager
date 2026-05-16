import { NextResponse } from "next/server"

import {
  cleanText,
  dateFromString,
  integerValue,
  isCashMovementType,
  isDateString,
  isMissingRecordError,
  jsonError,
  optionalCleanText,
  readJsonBody,
} from "@/lib/api-validation"
import { serializeCashMovement } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import type { CashMovement } from "@/lib/types"

export const runtime = "nodejs"

type CashMovementPayload = {
  id?: string
  date?: string
  type?: CashMovement["type"]
  category?: string
  amount?: number
  notes?: string
}

export async function POST(request: Request) {
  const body = await readJsonBody<CashMovementPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const amount = integerValue(payload.amount)
  const category = cleanText(payload.category)

  if (
    !isDateString(payload.date) ||
    !isCashMovementType(payload.type) ||
    !category ||
    amount === null ||
    amount < 0
  ) {
    return jsonError("Date, type, category, and amount are required.")
  }

  const data = {
    date: dateFromString(payload.date),
    type: payload.type,
    category,
    amount,
    currency: "MAD",
    notes: optionalCleanText(payload.notes),
  }

  try {
    const movement = payload.id
      ? await prisma.cashMovement.update({
          where: { id: payload.id },
          data,
        })
      : await prisma.cashMovement.create({ data })

    return NextResponse.json(serializeCashMovement(movement))
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Cash movement not found.", 404)
    }

    throw error
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return jsonError("Cash movement id is required.")
  }

  try {
    await prisma.cashMovement.delete({ where: { id } })
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Cash movement not found.", 404)
    }

    throw error
  }

  return NextResponse.json({ ok: true })
}
