import { NextResponse } from "next/server"

import {
  cleanText,
  integerValue,
  isCurrency,
  jsonError,
  readJsonBody,
} from "@/lib/api-validation"
import { serializeProperty } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import type { Currency } from "@/lib/types"

export const runtime = "nodejs"

type PropertyPayload = {
  id?: string
  name?: string
  legalName?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  ice?: string
  logoUrl?: string
  defaultCurrency?: Currency
  touristTaxMadPerPersonNight?: number
  vatRatePercent?: number
}

export async function POST(request: Request) {
  const body = await readJsonBody<PropertyPayload>(request)
  if (!body.ok) return body.response

  const payload = body.data
  const name = cleanText(payload.name)
  const legalName = cleanText(payload.legalName)
  const address = cleanText(payload.address)
  const city = cleanText(payload.city)
  const country = cleanText(payload.country)
  const phone = cleanText(payload.phone)
  const ice = cleanText(payload.ice)
  const logoUrl = cleanText(payload.logoUrl)
  const defaultCurrency = payload.defaultCurrency ?? "MAD"
  const touristTaxMadPerPersonNight =
    integerValue(payload.touristTaxMadPerPersonNight) ?? 0
  const vatRatePercent = integerValue(payload.vatRatePercent) ?? 0

  if (
    !name ||
    !legalName ||
    !address ||
    !city ||
    !country ||
    !phone ||
    !ice ||
    !isCurrency(defaultCurrency)
  ) {
    return jsonError(
      "Property name, address, legal details, phone, ICE, and currency are required."
    )
  }

  if (touristTaxMadPerPersonNight < 0 || vatRatePercent < 0) {
    return jsonError("Tourist tax and VAT rate cannot be negative.")
  }

  const currentProperty = payload.id
    ? await prisma.property.findUnique({ where: { id: payload.id } })
    : await prisma.property.findFirst()

  const data = {
    name,
    legalName,
    address,
    city,
    country,
    phone,
    ice,
    logoUrl,
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
