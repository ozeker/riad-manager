import "dotenv/config"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

import { PrismaClient } from "../src/generated/prisma/client"
import {
  cashMovements,
  guests,
  initialBookings,
  invoices,
  payments,
  property,
  rooms,
} from "../src/lib/mock-data"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
})

const prisma = new PrismaClient({ adapter })

function date(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

async function main() {
  await prisma.invoiceLine.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.cashMovement.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.room.deleteMany()
  await prisma.icalFeed.deleteMany()
  await prisma.property.deleteMany()

  await prisma.property.create({
    data: {
      id: "property-riad-al-fes",
      name: property.name,
      legalName: property.legalName,
      address: property.address,
      city: property.city,
      country: property.country,
      phone: property.phone,
      ice: property.ice,
      logoUrl: property.logoUrl,
      defaultCurrency: property.defaultCurrency,
      touristTaxMadPerPersonNight: 30,
      vatRatePercent: 10,
    },
  })

  for (const room of rooms) {
    await prisma.room.create({
      data: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        rateMad: room.rates.MAD,
        rateEur: room.rates.EUR,
        rateUsd: room.rates.USD,
        active: room.active,
      },
    })
  }

  for (const guest of guests) {
    await prisma.guest.create({
      data: {
        id: guest.id,
        fullName: guest.fullName,
        phone: guest.phone,
        email: guest.email,
        nationality: guest.nationality,
        documentNumber: guest.documentNumber,
        notes: guest.notes,
      },
    })
  }

  for (const booking of initialBookings) {
    const guest = guests.find((item) => item.fullName === booking.guestName)
    if (!guest) {
      throw new Error(`Missing guest for booking ${booking.id}`)
    }

    await prisma.booking.create({
      data: {
        id: booking.id,
        guestId: guest.id,
        roomId: booking.roomId,
        checkIn: date(booking.checkIn),
        checkOut: date(booking.checkOut),
        guests: booking.guests,
        source: booking.source,
        amount: booking.amount,
        currency: booking.currency,
        status: booking.status,
        notes: booking.notes,
      },
    })
  }

  for (const payment of payments) {
    await prisma.payment.create({
      data: {
        id: payment.id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        paymentDate: date(payment.paymentDate),
        notes: payment.notes,
      },
    })
  }

  for (const movement of cashMovements) {
    await prisma.cashMovement.create({
      data: {
        id: movement.id,
        date: date(movement.date),
        type: movement.type,
        category: movement.category,
        amount: movement.amount,
        currency: movement.currency,
        notes: movement.notes,
      },
    })
  }

  for (const invoice of invoices) {
    await prisma.invoice.create({
      data: {
        id: invoice.id,
        bookingId: invoice.bookingId,
        status: invoice.status,
        issueDate: date(invoice.issueDate),
        total: invoice.total,
        currency: invoice.currency,
        lines: {
          create: [
            {
              description: "Room stay",
              quantity: 1,
              unitPrice: invoice.total,
              total: invoice.total,
            },
          ],
        },
      },
    })
  }

  await prisma.icalFeed.createMany({
    data: [
      {
        id: "ical-booking",
        name: "Booking.com reservations",
        source: "Booking.com",
        roomId: "zellij-suite",
        url: "https://example.com/booking.ics",
      },
      {
        id: "ical-airbnb",
        name: "Airbnb reservations",
        source: "Airbnb",
        roomId: "family-suite",
        url: "https://example.com/airbnb.ics",
      },
      {
        id: "ical-hotelrunner",
        name: "HotelRunner reservations",
        source: "HotelRunner",
        roomId: "andalusia-room",
        url: "https://example.com/hotelrunner.ics",
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
