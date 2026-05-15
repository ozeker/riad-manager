import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatMoney } from "@/lib/format"
import { getProperty, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const [property, rooms] = await Promise.all([getProperty(), getRooms()])

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Settings"
        description="Property and room settings are mocked here before database storage is added."
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

        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Rooms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Capacity {room.capacity}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{formatMoney(room.rates.MAD, "MAD")}</Badge>
                  <Badge variant="outline">{formatMoney(room.rates.EUR, "EUR")}</Badge>
                  <Badge variant="outline">{formatMoney(room.rates.USD, "USD")}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
