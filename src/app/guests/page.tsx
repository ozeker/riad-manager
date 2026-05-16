import { ExportCsvButton } from "@/components/export-csv-button"
import { GuestManager } from "@/components/guests/guest-manager"
import { PageHeader } from "@/components/layout/page-header"
import { getBookings, getGuests, getRooms } from "@/lib/data"
import { translate } from "@/lib/i18n"
import { getRequestLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function GuestsPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translate(locale, text)
  const [guests, bookings, rooms] = await Promise.all([
    getGuests(),
    getBookings(),
    getRooms(),
  ])

  return (
    <>
      <PageHeader
        eyebrow={t("Records")}
        title={t("Guests")}
        description={t("Create and edit guest details while keeping booking history visible.")}
        action={<ExportCsvButton dataset="guests" label={t("Export CSV")} />}
      />
      <GuestManager guests={guests} bookings={bookings} rooms={rooms} />
    </>
  )
}
