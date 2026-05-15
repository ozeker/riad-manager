import { NextResponse } from "next/server"

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

const movementTypes: CashMovement["type"][] = [
  "opening balance",
  "cash in",
  "cash out",
  "closing balance",
]

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CashMovementPayload
  const amount = Number(payload.amount)
  const category = payload.category?.trim()

  if (
    !payload.date ||
    !payload.type ||
    !movementTypes.includes(payload.type) ||
    !category ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return NextResponse.json(
      { message: "Date, type, category, and amount are required." },
      { status: 400 }
    )
  }

  const data = {
    date: date(payload.date),
    type: payload.type,
    category,
    amount: Math.round(amount),
    currency: "MAD",
    notes: payload.notes?.trim() || null,
  }

  const movement = payload.id
    ? await prisma.cashMovement.update({
        where: { id: payload.id },
        data,
      })
    : await prisma.cashMovement.create({ data })

  return NextResponse.json(serializeCashMovement(movement))
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { message: "Cash movement id is required." },
      { status: 400 }
    )
  }

  await prisma.cashMovement.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
