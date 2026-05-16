import { DatabaseBackup } from "lucide-react"

import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { IcalFeedManager } from "@/components/settings/ical-feed-manager"
import { PropertyManager } from "@/components/settings/property-manager"
import { RoomManager } from "@/components/settings/room-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIcalFeeds, getProperty, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const [property, rooms, feeds] = await Promise.all([
    getProperty(),
    getRooms(),
    getIcalFeeds(),
  ])

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Settings"
        description="Manage the property profile and room setup used by bookings and the reservation calendar."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PropertyManager property={property} />
        <RoomManager rooms={rooms} />
        <div className="xl:col-span-2">
          <IcalFeedManager feeds={feeds} rooms={rooms} />
        </div>
        <Card className="rounded-lg border-border/80 shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DatabaseBackup className="size-4" />
              Backup exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <ExportCsvButton dataset="bookings" label="Bookings" />
              <ExportCsvButton dataset="guests" label="Guests" />
              <ExportCsvButton dataset="payments" label="Payments" />
              <ExportCsvButton dataset="invoices" label="Invoices" />
              <ExportCsvButton dataset="cash-movements" label="Cash" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
