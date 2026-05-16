import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { InvoiceManager } from "@/components/invoices/invoice-manager"
import { getBookings, getInvoices, getProperty, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const [invoices, bookings, rooms, property] = await Promise.all([
    getInvoices(),
    getBookings(),
    getRooms(),
    getProperty(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Invoices"
        description="Create editable invoice drafts from bookings. PDF generation comes later."
        action={<ExportCsvButton dataset="invoices" />}
      />
      <InvoiceManager
        invoices={invoices}
        bookings={bookings}
        rooms={rooms}
        touristTaxMadPerPersonNight={
          property?.touristTaxMadPerPersonNight ?? 30
        }
      />
    </>
  )
}
