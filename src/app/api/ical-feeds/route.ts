import { NextResponse } from "next/server"

import { serializeIcalFeed } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import type { IcalFeed } from "@/lib/types"

export const runtime = "nodejs"

type IcalFeedPayload = {
  id?: string
  name?: string
  source?: IcalFeed["source"]
  url?: string
  active?: boolean
}

const sources: IcalFeed["source"][] = [
  "Booking.com",
  "Airbnb",
  "HotelRunner",
  "Other",
]

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as IcalFeedPayload
  const name = payload.name?.trim()
  const url = payload.url?.trim()

  if (!name || !payload.source || !sources.includes(payload.source) || !url) {
    return NextResponse.json(
      { message: "Name, source, and URL are required." },
      { status: 400 }
    )
  }

  if (!isValidUrl(url)) {
    return NextResponse.json(
      { message: "Enter a valid http or https iCal URL." },
      { status: 400 }
    )
  }

  const data = {
    name,
    source: payload.source,
    url,
    active: payload.active ?? true,
  }

  const feed = payload.id
    ? await prisma.icalFeed.update({
        where: { id: payload.id },
        data,
      })
    : await prisma.icalFeed.create({ data })

  return NextResponse.json(serializeIcalFeed(feed))
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { message: "iCal feed id is required." },
      { status: 400 }
    )
  }

  await prisma.icalFeed.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
