import { PageHeader } from "@/components/layout/page-header"
import { IcalFeedManager } from "@/components/settings/ical-feed-manager"
import { PropertyManager } from "@/components/settings/property-manager"
import { RoomManager } from "@/components/settings/room-manager"
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
      </div>
    </>
  )
}
