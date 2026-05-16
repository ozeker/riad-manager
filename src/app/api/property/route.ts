import { NextResponse } from "next/server"

import { serializeProperty } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import type { Currency } from "@/lib/types"

export const runtime = "nodejs"

type PropertyPayload = {
  id?: string
  name?: string
  legalName?: string
  city?: string
  country?: string
  phone?: string
  ice?: string
  defaultCurrency?: Currency
  touristTaxMadPerPersonNight?: number
  vatRatePercent?: number
}

const currencies: Currency[] = ["MAD", "EUR", "USD"]

function cleanText(value: string | undefined) {
  return value?.trim() ?? ""
}

export async function POST(request: Request) {
  const payload = (await request.json()) as PropertyPayload
  const name = cleanText(payload.name)
  const legalName = cleanText(payload.legalName)
  const city = cleanText(payload.city)
  const country = cleanText(payload.country)
  const phone = cleanText(payload.phone)
  const ice = cleanText(payload.ice)
  const defaultCurrency = payload.defaultCurrency ?? "MAD"
  const touristTaxMadPerPersonNight = Math.max(
    0,
    Math.round(Number(payload.touristTaxMadPerPersonNight) || 0)
  )
  const vatRatePercent = Math.max(
    0,
    Math.round(Number(payload.vatRatePercent) || 0)
  )

  if (
    !name ||
    !legalName ||
    !city ||
    !country ||
    !phone ||
    !ice ||
    !currencies.includes(defaultCurrency)
  ) {
    return NextResponse.json(
      { message: "Property name, legal details, phone, ICE, and currency are required." },
      { status: 400 }
    )
  }

  const currentProperty = payload.id
    ? await prisma.property.findUnique({ where: { id: payload.id } })
    : await prisma.property.findFirst()

  const data = {
    name,
    legalName,
    city,
    country,
    phone,
    ice,
    defaultCurrency,
    touristTaxMadPerPersonNight,
    vatRatePercent,
  }

  const property = currentProperty
    ? await prisma.property.update({
        where: { id: currentProperty.id },
        data,
      })
    : await prisma.property.create({
        data: {
          id: "property-riad-al-fes",
          ...data,
        },
      })

  return NextResponse.json(serializeProperty(property))
}
