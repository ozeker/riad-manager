import { NextResponse } from "next/server"

import {
  cleanText,
  integerValue,
  isMissingRecordError,
  jsonError,
  readJsonBody,
} from "@/lib/api-validation"
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
  const body = await readJsonBody<RoomPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const name = cleanText(payload.name)
  const capacity = integerValue(payload.capacity)
  const rateMad = integerValue(payload.rates?.MAD)
  const rateEur = integerValue(payload.rates?.EUR)
  const rateUsd = integerValue(payload.rates?.USD)

  if (!name) {
    return jsonError("Room name is required.")
  }

  if (
    capacity === null ||
    capacity < 1 ||
    rateMad === null ||
    rateMad < 0 ||
    rateEur === null ||
    rateEur < 0 ||
    rateUsd === null ||
    rateUsd < 0
  ) {
    return jsonError("Capacity and rates must be valid numbers.")
  }

  const data = {
    name,
    capacity,
    rateMad,
    rateEur,
    rateUsd,
    active: payload.active ?? true,
  }

  try {
    const room = payload.id
      ? await prisma.room.update({
          where: { id: payload.id },
          data,
        })
      : await prisma.room.create({ data })

    return NextResponse.json(serializeRoom(room))
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("Room not found.", 404)
    }

    throw error
  }
}
