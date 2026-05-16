import { PageHeader } from "@/components/layout/page-header"
import { IcalFeedManager } from "@/components/settings/ical-feed-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomManager } from "@/components/settings/room-manager"
import { Separator } from "@/components/ui/separator"
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
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{property?.name ?? "Riad Al Fes"}</span>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Legal name</span>
              <span className="font-medium">
                {property?.legalName ?? "Riad Al Fes SARL"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">
                {property?.phone ?? "+212 600 000 000"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ICE</span>
              <span className="font-medium">{property?.ice ?? "001234567000089"}</span>
            </div>
          </CardContent>
        </Card>

        <RoomManager rooms={rooms} />
        <div className="xl:col-span-2">
          <IcalFeedManager feeds={feeds} rooms={rooms} />
        </div>
      </div>
    </>
  )
}
