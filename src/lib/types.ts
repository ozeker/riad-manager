export type Currency = "MAD" | "EUR" | "USD"

export type BookingSource =
  | "Booking.com"
  | "Airbnb"
  | "HotelRunner"
  | "Direct"
  | "Walk-in"
  | "Other"

export type BookingStatus =
  | "confirmed"
  | "checked in"
  | "checked out"
  | "cancelled"
  | "no show"

export type Room = {
  id: string
  name: string
  capacity: number
  rates: Record<Currency, number>
  active: boolean
}

export type Booking = {
  id: string
  guestId: string
  guestName: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  source: BookingSource
  amount: number
  currency: Currency
  status: BookingStatus
  notes: string
}

export type Guest = {
  id: string
  fullName: string
  phone: string
  email: string
  nationality: string
  documentNumber: string
  notes: string
}

export type PaymentStatus = "unpaid" | "partial" | "paid"

export type Payment = {
  id: string
  bookingId: string
  guestName: string
  amount: number
  currency: Currency
  method: "cash" | "card" | "bank transfer" | "OTA prepaid" | "other"
  paymentDate: string
  notes: string
}

export type CashMovement = {
  id: string
  date: string
  type: "opening balance" | "cash in" | "cash out" | "closing balance"
  category: string
  amount: number
  currency: "MAD"
  notes: string
}

export type Invoice = {
  id: string
  bookingId: string
  guestName: string
  status: "draft" | "final"
  total: number
  currency: Currency
  issueDate: string
}
