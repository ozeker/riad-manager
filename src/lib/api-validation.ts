import { NextResponse } from "next/server"

import type { Booking, CashMovement, Currency, IcalFeed, Payment } from "@/lib/types"

export const currencies: Currency[] = ["MAD", "EUR", "USD"]
export const bookingSources: Booking["source"][] = [
  "Booking.com",
  "Airbnb",
  "HotelRunner",
  "Direct",
  "Walk-in",
  "Other",
]
export const bookingStatuses: Booking["status"][] = [
  "confirmed",
  "checked in",
  "checked out",
  "cancelled",
  "no show",
]
export const paymentMethods: Payment["method"][] = [
  "cash",
  "card",
  "bank transfer",
  "OTA prepaid",
  "other",
]
export const cashMovementTypes: CashMovement["type"][] = [
  "opening balance",
  "cash in",
  "cash out",
  "closing balance",
]
export const icalSources: IcalFeed["source"][] = [
  "Booking.com",
  "Airbnb",
  "HotelRunner",
  "Other",
]

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status })
}

export async function readJsonBody<T>(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false as const, response: jsonError("Invalid request body.") }
    }

    return { ok: true as const, data: body as T }
  } catch {
    return { ok: false as const, response: jsonError("Invalid request body.") }
  }
}

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function optionalCleanText(value: unknown) {
  const text = cleanText(value)
  return text.length > 0 ? text : null
}

export function numberValue(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function integerValue(value: unknown) {
  const number = numberValue(value)
  return number === null ? null : Math.round(number)
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && currencies.includes(value as Currency)
}

export function isBookingSource(value: unknown): value is Booking["source"] {
  return (
    typeof value === "string" &&
    bookingSources.includes(value as Booking["source"])
  )
}

export function isBookingStatus(value: unknown): value is Booking["status"] {
  return (
    typeof value === "string" &&
    bookingStatuses.includes(value as Booking["status"])
  )
}

export function isPaymentMethod(value: unknown): value is Payment["method"] {
  return (
    typeof value === "string" &&
    paymentMethods.includes(value as Payment["method"])
  )
}

export function isCashMovementType(value: unknown): value is CashMovement["type"] {
  return (
    typeof value === "string" &&
    cashMovementTypes.includes(value as CashMovement["type"])
  )
}

export function isIcalSource(value: unknown): value is IcalFeed["source"] {
  return typeof value === "string" && icalSources.includes(value as IcalFeed["source"])
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function dateFromString(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function isMissingRecordError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2025"
  )
}
