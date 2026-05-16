import ICAL from "ical.js"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type IcalImportPayload = {
  feedId?: string
}

type ImportResult = {
  feedId: string
  feedName: string
  source: string
  imported: number
  updated: number
  skipped: number
  error?: string
}

type IcalFeedForImport = {
  id: string
  name: string
  source: string
  url: string
  roomId: string | null
}

function icalTimeToDate(value: ICAL.Time) {
  return new Date(Date.UTC(value.year, value.month - 1, value.day))
}

function fallbackEndDate(startDate: Date) {
  const endDate = new Date(startDate)
  endDate.setUTCDate(endDate.getUTCDate() + 1)
  return endDate
}

function getGuestName(summary: string, source: string) {
  const cleanSummary = summary.trim()

  if (!cleanSummary || cleanSummary.toLowerCase() === "reserved") {
    return `${source} guest`
  }

  return cleanSummary
}

async function fetchCalendar(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/calendar, text/plain, */*",
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`Feed returned HTTP ${response.status}.`)
  }

  return response.text()
}

async function importFeed(feed: IcalFeedForImport): Promise<ImportResult> {
  const result: ImportResult = {
    feedId: feed.id,
    feedName: feed.name,
    source: feed.source,
    imported: 0,
    updated: 0,
    skipped: 0,
  }

  if (!feed.roomId) {
    return {
      ...result,
      skipped: 1,
      error: "Feed is not assigned to a room.",
    }
  }

  try {
    const calendarText = await fetchCalendar(feed.url)
    const calendar = new ICAL.Component(ICAL.parse(calendarText))
    const events = calendar.getAllSubcomponents("vevent")

    for (const component of events) {
      const event = new ICAL.Event(component)
      const status = String(component.getFirstPropertyValue("status") ?? "")
      const startDate = event.startDate

      if (!startDate) {
        result.skipped += 1
        continue
      }

      const uid = event.uid || `${event.summary}-${startDate.toString()}`
      const checkIn = icalTimeToDate(startDate)
      let checkOut = event.endDate
        ? icalTimeToDate(event.endDate)
        : fallbackEndDate(checkIn)

      if (checkOut <= checkIn) {
        checkOut = fallbackEndDate(checkIn)
      }

      const guestName = getGuestName(event.summary ?? "", feed.source)
      const guest =
        (await prisma.guest.findFirst({ where: { fullName: guestName } })) ??
        (await prisma.guest.create({
          data: {
            fullName: guestName,
            notes: `Created from ${feed.name} iCal import.`,
          },
        }))

      const existingBooking = await prisma.booking.findUnique({
        where: {
          importedFromFeedId_externalEventId: {
            importedFromFeedId: feed.id,
            externalEventId: uid,
          },
        },
      })

      const bookingData = {
        guestId: guest.id,
        roomId: feed.roomId,
        checkIn,
        checkOut,
        guests: 1,
        source: feed.source,
        amount: 0,
        currency: "MAD",
        status: status.toLowerCase() === "cancelled" ? "cancelled" : "confirmed",
        notes: `Imported from ${feed.name}. External event: ${uid}`,
        importedFromFeedId: feed.id,
        externalEventId: uid,
        importedAt: new Date(),
      }

      if (existingBooking) {
        await prisma.booking.update({
          where: { id: existingBooking.id },
          data: bookingData,
        })
        result.updated += 1
      } else {
        await prisma.booking.create({ data: bookingData })
        result.imported += 1
      }
    }

    await prisma.icalFeed.update({
      where: { id: feed.id },
      data: { lastSyncedAt: new Date() },
    })
  } catch (error) {
    return {
      ...result,
      error: error instanceof Error ? error.message : "Unknown import error.",
    }
  }

  return result
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as IcalImportPayload
  const feeds = await prisma.icalFeed.findMany({
    where: {
      active: true,
      ...(payload.feedId ? { id: payload.feedId } : {}),
    },
    orderBy: { createdAt: "asc" },
  })

  const results: ImportResult[] = []

  for (const feed of feeds) {
    results.push(await importFeed(feed))
  }

  return NextResponse.json({
    imported: results.reduce((sum, result) => sum + result.imported, 0),
    updated: results.reduce((sum, result) => sum + result.updated, 0),
    skipped: results.reduce((sum, result) => sum + result.skipped, 0),
    errors: results.filter((result) => result.error).length,
    results,
  })
}
