import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

type InvoicePdfLine = {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

type InvoicePdfData = {
  id: string
  finalNumber: string | null
  status: string
  finalizedAt: Date | null
  issueDate: Date
  total: number
  currency: string
  property: {
    name: string
    legalName: string
    city: string
    country: string
    phone: string
    ice: string
    vatRatePercent: number
  }
  booking: {
    checkIn: Date
    checkOut: Date
    guests: number
    source: string
    guest: {
      fullName: string
      phone: string | null
      email: string | null
      nationality: string | null
      documentNumber: string | null
    }
    room: {
      name: string
    }
  }
  lines: InvoicePdfLine[]
}

const pageWidth = 595
const pageHeight = 842
const margin = 48

function safeText(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "-")
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function formatPdfMoney(amount: number, currency: string) {
  return `${amount.toLocaleString("en-US", {
    maximumFractionDigits: currency === "MAD" ? 0 : 2,
  })} ${currency}`
}

function wrapText(text: string, maxChars: number) {
  const words = safeText(text).split(/\s+/)
  const lines: string[] = []
  let line = ""

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word
    if (nextLine.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = nextLine
    }
  }

  if (line) {
    lines.push(line)
  }

  return lines.length > 0 ? lines : [""]
}

export async function createInvoiceDraftPdf(invoice: InvoicePdfData) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([pageWidth, pageHeight])
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = pageHeight - margin

  function drawText(
    text: string,
    x: number,
    currentY: number,
    options?: {
      size?: number
      bold?: boolean
      color?: ReturnType<typeof rgb>
      maxWidth?: number
    }
  ) {
    page.drawText(safeText(text), {
      x,
      y: currentY,
      size: options?.size ?? 10,
      font: options?.bold ? bold : regular,
      color: options?.color ?? rgb(0.12, 0.14, 0.17),
      maxWidth: options?.maxWidth,
    })
  }

  function drawRule(currentY: number) {
    page.drawLine({
      start: { x: margin, y: currentY },
      end: { x: pageWidth - margin, y: currentY },
      thickness: 0.75,
      color: rgb(0.82, 0.84, 0.88),
    })
  }

  const invoiceTitle =
    invoice.status === "final" ? "FINAL INVOICE" : "DRAFT INVOICE"
  const invoiceNumber = invoice.finalNumber ?? invoice.id

  drawText(invoice.property.name, margin, y, { size: 20, bold: true })
  drawText(invoiceTitle, pageWidth - 185, y + 2, {
    size: 15,
    bold: true,
    color: invoice.status === "final" ? rgb(0.12, 0.14, 0.17) : rgb(0.72, 0.16, 0.16),
  })
  y -= 18
  drawText(invoice.property.legalName, margin, y, { size: 10 })
  y -= 14
  drawText(
    `${invoice.property.city}, ${invoice.property.country} | Phone: ${invoice.property.phone} | ICE: ${invoice.property.ice}`,
    margin,
    y,
    { size: 9, color: rgb(0.35, 0.38, 0.44) }
  )
  y -= 28
  drawRule(y)
  y -= 28

  drawText("Invoice", margin, y, { size: 12, bold: true })
  drawText("Guest", 330, y, { size: 12, bold: true })
  y -= 17
  drawText(`Number: ${invoiceNumber}`, margin, y)
  drawText(invoice.booking.guest.fullName, 330, y, { bold: true })
  y -= 14
  drawText(`Issue date: ${formatDate(invoice.issueDate)}`, margin, y)
  drawText(`Phone: ${invoice.booking.guest.phone || "-"}`, 330, y)
  y -= 14
  drawText(`Status: ${invoice.status}`, margin, y)
  drawText(`Email: ${invoice.booking.guest.email || "-"}`, 330, y)
  y -= 14
  if (invoice.finalizedAt) {
    drawText(`Finalized: ${formatDate(invoice.finalizedAt)}`, margin, y)
    y -= 14
  }
  drawText(`Source: ${invoice.booking.source}`, margin, y)
  drawText(`Nationality: ${invoice.booking.guest.nationality || "-"}`, 330, y)
  y -= 14
  drawText(`ID/Passport: ${invoice.booking.guest.documentNumber || "-"}`, 330, y)
  y -= 28

  drawText("Stay details", margin, y, { size: 12, bold: true })
  y -= 17
  drawText(`Room: ${invoice.booking.room.name}`, margin, y)
  drawText(`Guests: ${invoice.booking.guests}`, 330, y)
  y -= 14
  drawText(
    `Dates: ${formatDate(invoice.booking.checkIn)} to ${formatDate(invoice.booking.checkOut)}`,
    margin,
    y
  )
  y -= 28

  drawRule(y)
  y -= 22
  drawText("Description", margin, y, { bold: true })
  drawText("Qty", 340, y, { bold: true })
  drawText("Unit", 390, y, { bold: true })
  drawText("Total", 490, y, { bold: true })
  y -= 12
  drawRule(y)
  y -= 18

  for (const line of invoice.lines) {
    const descriptionLines = wrapText(line.description, 46)
    const rowY = y

    descriptionLines.forEach((descriptionLine, index) => {
      drawText(descriptionLine, margin, y - index * 12)
    })

    drawText(String(line.quantity), 340, rowY)
    drawText(formatPdfMoney(line.unitPrice, invoice.currency), 390, rowY)
    drawText(formatPdfMoney(line.total, invoice.currency), 490, rowY)
    y -= Math.max(18, descriptionLines.length * 12 + 8)
  }

  drawRule(y)
  y -= 24
  drawText("Total", 390, y, { size: 13, bold: true })
  drawText(formatPdfMoney(invoice.total, invoice.currency), 490, y, {
    size: 13,
    bold: true,
  })
  y -= 34

  drawText(
    `VAT rate configured for property: ${invoice.property.vatRatePercent}%. Tax lines remain editable before finalization.`,
    margin,
    y,
    { size: 9, color: rgb(0.35, 0.38, 0.44), maxWidth: pageWidth - margin * 2 }
  )
  y -= 18
  if (invoice.status !== "final") {
    drawText(
      "This is a draft invoice for review only. It is not finalized and has no legal invoice sequence yet.",
      margin,
      y,
      { size: 9, color: rgb(0.72, 0.16, 0.16), maxWidth: pageWidth - margin * 2 }
    )
  } else {
    drawText(
      "This invoice has been finalized. Further edits are locked in Riad Manager.",
      margin,
      y,
      { size: 9, color: rgb(0.35, 0.38, 0.44), maxWidth: pageWidth - margin * 2 }
    )
  }

  return pdf.save()
}
