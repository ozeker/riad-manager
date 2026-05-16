import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { getBookings, getGuests, getRooms } from "@/lib/data"
import { translate } from "@/lib/i18n"
import { getRequestLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translate(locale, text)
  const [rooms, bookings, guests] = await Promise.all([
    getRooms({ activeOnly: true }),
    getBookings(),
    getGuests(),
  ])

  return (
    <>
      <PageHeader
        eyebrow={t("Reservations")}
        title={t("Calendar")}
        description={t("Click an empty cell to create a booking, or click an existing block to edit it.")}
        badge={`${rooms.length} ${t("active rooms")}`}
        action={
          <Button asChild variant="outline">
            <a href="/settings">{t("Manage iCal feeds")}</a>
          </Button>
        }
      />
      <CalendarGrid rooms={rooms} initialBookings={bookings} guests={guests} />
    </>
  )
}
