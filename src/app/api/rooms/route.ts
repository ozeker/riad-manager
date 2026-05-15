import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type RoomPayload = {
  id?: string
  name?: string
  capacity?: number
  rates?: {
    MAD?: number
    EUR?: number
    USD?: number
  }
  active?: boolean
}

function serializeRoom(room: {
  id: string
  name: string
  capacity: number
  rateMad: number
  rateEur: number
  rateUsd: number
  active: boolean
}) {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    rates: {
      MAD: room.rateMad,
      EUR: room.rateEur,
      USD: room.rateUsd,
    },
    active: room.active,
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RoomPayload
  const name = payload.name?.trim()
  const capacity = Number(payload.capacity)
  const rateMad = Number(payload.rates?.MAD)
  const rateEur = Number(payload.rates?.EUR)
  const rateUsd = Number(payload.rates?.USD)

  if (!name) {
    return NextResponse.json({ message: "Room name is required." }, { status: 400 })
  }

  if (
    !Number.isFinite(capacity) ||
    capacity < 1 ||
    !Number.isFinite(rateMad) ||
    rateMad < 0 ||
    !Number.isFinite(rateEur) ||
    rateEur < 0 ||
    !Number.isFinite(rateUsd) ||
    rateUsd < 0
  ) {
    return NextResponse.json(
      { message: "Capacity and rates must be valid numbers." },
      { status: 400 }
    )
  }

  const data = {
    name,
    capacity: Math.round(capacity),
    rateMad: Math.round(rateMad),
    rateEur: Math.round(rateEur),
    rateUsd: Math.round(rateUsd),
    active: payload.active ?? true,
  }

  const room = payload.id
    ? await prisma.room.update({
        where: { id: payload.id },
        data,
      })
    : await prisma.room.create({ data })

  return NextResponse.json(serializeRoom(room))
}
