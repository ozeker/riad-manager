import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { PaymentManager } from "@/components/payments/payment-manager"
import { getBookings, getPayments, getRooms } from "@/lib/data"
import { translate } from "@/lib/i18n"
import { getRequestLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function PaymentsPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translate(locale, text)
  const [payments, bookings, rooms] = await Promise.all([
    getPayments(),
    getBookings(),
    getRooms(),
  ])

  return (
    <>
      <PageHeader
        eyebrow={t("Money")}
        title={t("Payments")}
        description={t("Record, edit, and review payments across cash, card, bank transfer, OTA prepaid, and other methods.")}
        action={<ExportCsvButton dataset="payments" label={t("Export CSV")} />}
      />
      <PaymentManager payments={payments} bookings={bookings} rooms={rooms} />
    </>
  )
}
