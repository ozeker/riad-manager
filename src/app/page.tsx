import {
  CalendarCheck,
  CreditCard,
  Hotel,
  WalletCards,
} from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatMoney } from "@/lib/format"
import { initialBookings, payments, property, rooms } from "@/lib/mock-data"

export default function DashboardPage() {
  const paidMad = payments
    .filter((payment) => payment.currency === "MAD")
    .reduce((total, payment) => total + payment.amount, 0)

  return (
    <>
      <PageHeader
        eyebrow="Today"
        title="Riad operations dashboard"
        description="A calm overview of bookings, rooms, payments, and cash for the owner."
        badge="UI prototype"
        action={<Button>Manual booking</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active rooms"
          value={`${rooms.length}`}
          detail="All rooms available for booking"
          icon={Hotel}
          tone="blue"
        />
        <StatCard
          title="June bookings"
          value={`${initialBookings.length}`}
          detail="Across Booking.com, Airbnb, direct, and walk-in"
          icon={CalendarCheck}
          tone="green"
        />
        <StatCard
          title="Recorded cash"
          value={formatMoney(paidMad, "MAD")}
          detail="Cash-heavy payments tracked separately"
          icon={WalletCards}
          tone="amber"
        />
        <StatCard
          title="Open balances"
          value="2"
          detail="Bookings with partial or pending payment"
          icon={CreditCard}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming arrivals</CardTitle>
            <Badge variant="secondary">{property.name}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialBookings.slice(0, 5).map((booking) => {
                  const room = rooms.find((item) => item.id === booking.roomId)

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.guestName}</TableCell>
                      <TableCell>{room?.name}</TableCell>
                      <TableCell>
                        {booking.checkIn} to {booking.checkOut}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(booking.amount, booking.currency)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Owner focus</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cash" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              <TabsContent value="cash" className="mt-4 space-y-3 text-sm">
                <p className="leading-6 text-muted-foreground">
                  Track opening balance, cash in, cash out, and closing balance
                  without needing accounting software.
                </p>
                <Badge variant="outline">Cash-first workflow</Badge>
              </TabsContent>
              <TabsContent value="invoices" className="mt-4 space-y-3 text-sm">
                <p className="leading-6 text-muted-foreground">
                  Invoice drafts stay editable before finalization, including
                  tourist tax and VAT lines.
                </p>
                <Badge variant="outline">Draft before final</Badge>
              </TabsContent>
              <TabsContent value="export" className="mt-4 space-y-3 text-sm">
                <p className="leading-6 text-muted-foreground">
                  The owner should always be able to export clean CSV records
                  for bookings, guests, payments, invoices, and cash.
                </p>
                <Badge variant="outline">Owner controls data</Badge>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
