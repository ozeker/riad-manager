import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Calendar"
        description="Click an empty cell to create a booking, or click an existing block to edit it."
        badge="Mock data"
        action={<Button variant="outline">Import iCal later</Button>}
      />
      <CalendarGrid />
    </>
  )
}
