import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { PaymentManager } from "@/components/payments/payment-manager"
import { getBookings, getPayments, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function PaymentsPage() {
  const [payments, bookings, rooms] = await Promise.all([
    getPayments(),
    getBookings(),
    getRooms(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Payments"
        description="Record, edit, and review payments across cash, card, bank transfer, OTA prepaid, and other methods."
        action={<ExportCsvButton dataset="payments" />}
      />
      <PaymentManager payments={payments} bookings={bookings} rooms={rooms} />
    </>
  )
}
