import { NextResponse } from "next/server"

import {
  cleanText,
  isHttpUrl,
  isIcalSource,
  isMissingRecordError,
  jsonError,
  readJsonBody,
} from "@/lib/api-validation"
import { serializeIcalFeed } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import type { IcalFeed } from "@/lib/types"

export const runtime = "nodejs"

type IcalFeedPayload = {
  id?: string
  name?: string
  source?: IcalFeed["source"]
  roomId?: string
  url?: string
  active?: boolean
}

export async function POST(request: Request) {
  const body = await readJsonBody<IcalFeedPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const name = cleanText(payload.name)
  const url = cleanText(payload.url)

  if (!name || !isIcalSource(payload.source) || !url) {
    return jsonError("Name, source, and URL are required.")
  }

  if (!isHttpUrl(url)) {
    return jsonError("Enter a valid http or https iCal URL.")
  }

  if (payload.roomId) {
    const room = await prisma.room.findUnique({ where: { id: payload.roomId } })

    if (!room) {
      return jsonError("Room not found.", 404)
    }
  }

  const data = {
    name,
    source: payload.source,
    roomId: payload.roomId || null,
    url,
    active: payload.active ?? true,
  }

  let feed: { id: string }
  try {
    feed = payload.id
      ? await prisma.icalFeed.update({
          where: { id: payload.id },
          data,
        })
      : await prisma.icalFeed.create({ data })
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("iCal feed not found.", 404)
    }

    throw error
  }

  const savedFeed = await prisma.icalFeed.findUniqueOrThrow({
    where: { id: feed.id },
    include: { room: true },
  })

  return NextResponse.json(serializeIcalFeed(savedFeed))
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return jsonError("iCal feed id is required.")
  }

  try {
    await prisma.icalFeed.delete({ where: { id } })
  } catch (error) {
    if (isMissingRecordError(error)) {
      return jsonError("iCal feed not found.", 404)
    }

    throw error
  }

  return NextResponse.json({ ok: true })
}
