"use client"

import type { CSSProperties } from "react"

import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/format"
import type { Booking, BookingSource } from "@/lib/types"
import { cn } from "@/lib/utils"

const sourceClass: Record<BookingSource, string> = {
  "Booking.com": "border-sky-300 bg-sky-100 text-sky-950",
  Airbnb: "border-rose-300 bg-rose-100 text-rose-950",
  HotelRunner: "border-violet-300 bg-violet-100 text-violet-950",
  Direct: "border-emerald-300 bg-emerald-100 text-emerald-950",
  "Walk-in": "border-amber-300 bg-amber-100 text-amber-950",
  Other: "border-zinc-300 bg-zinc-100 text-zinc-950",
}

type BookingBlockProps = {
  booking: Booking
  style: CSSProperties
  onClick: () => void
}

export function BookingBlock({ booking, style, onClick }: BookingBlockProps) {
  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      className={cn(
        "pointer-events-auto z-10 m-1 flex min-w-0 flex-col justify-between rounded-md border px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        sourceClass[booking.source]
      )}
    >
      <span className="truncate text-sm font-semibold">{booking.guestName}</span>
      <span className="mt-1 flex items-center justify-between gap-2 text-xs">
        <span className="truncate">{formatMoney(booking.amount, booking.currency)}</span>
        <Badge variant="secondary" className="h-5 shrink-0 rounded">
          {booking.source}
        </Badge>
      </span>
    </button>
  )
}
