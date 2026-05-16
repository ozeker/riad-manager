import { BookingManager } from "@/components/bookings/booking-manager"
import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { getBookings, getGuests, getPayments, getRooms } from "@/lib/data"
import { translate } from "@/lib/i18n"
import { getRequestLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function BookingsPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translate(locale, text)
  const [bookings, rooms, guests, payments] = await Promise.all([
    getBookings(),
    getRooms(),
    getGuests(),
    getPayments(),
  ])

  return (
    <>
      <PageHeader
        eyebrow={t("Operations")}
        title={t("Bookings")}
        description={t("Create, edit, cancel, and archive reservations while keeping payment status visible.")}
        action={<ExportCsvButton dataset="bookings" label={t("Export CSV")} />}
      />
      <BookingManager
        bookings={bookings}
        rooms={rooms}
        guests={guests}
        payments={payments}
      />
    </>
  )
}
