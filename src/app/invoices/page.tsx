import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { InvoiceManager } from "@/components/invoices/invoice-manager"
import { getBookings, getInvoices, getProperty, getRooms } from "@/lib/data"
import { translate } from "@/lib/i18n"
import { getRequestLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translate(locale, text)
  const [invoices, bookings, rooms, property] = await Promise.all([
    getInvoices(),
    getBookings(),
    getRooms(),
    getProperty(),
  ])

  return (
    <>
      <PageHeader
        eyebrow={t("Documents")}
        title={t("Invoices")}
        description={t("Create invoice drafts, generate PDFs, and finalize locked invoice numbers.")}
        action={<ExportCsvButton dataset="invoices" label={t("Export CSV")} />}
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
