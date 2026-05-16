import {
  CalendarCheck,
  CreditCard,
  Hotel,
  WalletCards,
} from "lucide-react"

import { ExportCsvButton } from "@/components/export-csv-button"
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
import {
  getBookings,
  getCashMovements,
  getInvoices,
  getPayments,
  getProperty,
  getRooms,
} from "@/lib/data"
import type { Booking, CashMovement, Currency, Payment } from "@/lib/types"

export const dynamic = "force-dynamic"

const inactiveBookingStatuses = new Set<Booking["status"]>([
  "cancelled",
  "no show",
])

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function isActiveBooking(booking: Booking) {
  return !inactiveBookingStatuses.has(booking.status)
}

function calculatePaymentTotals(payments: Payment[]) {
  return payments.reduce<Record<string, Partial<Record<Currency, number>>>>(
    (totals, payment) => {
      const bookingTotals = totals[payment.bookingId] ?? {}
      bookingTotals[payment.currency] =
        (bookingTotals[payment.currency] ?? 0) + payment.amount
      totals[payment.bookingId] = bookingTotals

      return totals
    },
    {}
  )
}

function getBookingBalance(
  booking: Booking,
  paymentTotals: Record<string, Partial<Record<Currency, number>>>
) {
  const paidInBookingCurrency =
    paymentTotals[booking.id]?.[booking.currency] ?? 0

  return Math.max(booking.amount - paidInBookingCurrency, 0)
}

function getCashPosition(cashMovements: CashMovement[]) {
  const latestClosingBalance = [...cashMovements]
    .filter((movement) => movement.type === "closing balance")
    .sort((left, right) => right.date.localeCompare(left.date))[0]

  if (latestClosingBalance) {
    return latestClosingBalance.amount
  }

  return cashMovements.reduce((total, movement) => {
    if (movement.type === "cash out") {
      return total - movement.amount
    }

    return total + movement.amount
  }, 0)
}

export default async function DashboardPage() {
  const [rooms, bookings, payments, cashMovements, invoices, property] =
    await Promise.all([
    getRooms(),
    getBookings(),
    getPayments(),
    getCashMovements(),
    getInvoices(),
    getProperty(),
  ])

  const today = todayString()
  const activeRoomCount = rooms.filter((room) => room.active).length
  const activeBookings = bookings.filter(isActiveBooking)
  const occupiedRoomCount = new Set(
    activeBookings
      .filter((booking) => booking.checkIn <= today && booking.checkOut > today)
      .map((booking) => booking.roomId)
  ).size
  const occupancyPercent =
    activeRoomCount === 0
      ? 0
      : Math.round((occupiedRoomCount / activeRoomCount) * 100)
  const upcomingBookings = activeBookings.filter(
    (booking) => booking.checkIn >= today
  )
  const arrivalsToday = activeBookings.filter(
    (booking) => booking.checkIn === today
  ).length
  const paymentTotals = calculatePaymentTotals(payments)
  const bookingsWithOpenBalance = activeBookings.filter(
    (booking) => getBookingBalance(booking, paymentTotals) > 0
  )
  const openBalanceTotalMad = bookingsWithOpenBalance
    .filter((booking) => booking.currency === "MAD")
    .reduce(
      (total, booking) => total + getBookingBalance(booking, paymentTotals),
      0
    )
  const cashPositionMad = getCashPosition(cashMovements)
  const recentCashMovements = [...cashMovements]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 3)
  const draftInvoiceCount = invoices.filter(
    (invoice) => invoice.status === "draft"
  ).length

  return (
    <>
      <PageHeader
        eyebrow="Today"
        title="Riad operations dashboard"
        description="A calm overview of bookings, rooms, payments, and cash for the owner."
        badge={property?.name ?? "Riad Manager"}
        action={<Button>Manual booking</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Occupied today"
          value={`${occupiedRoomCount}/${activeRoomCount}`}
          detail={`${occupancyPercent}% occupancy across active rooms`}
          icon={Hotel}
          tone="blue"
        />
        <StatCard
          title="Upcoming arrivals"
          value={`${upcomingBookings.length}`}
          detail={`${arrivalsToday} arriving today`}
          icon={CalendarCheck}
          tone="green"
        />
        <StatCard
          title="Cash position"
          value={formatMoney(cashPositionMad, "MAD")}
          detail="Latest closing balance or calculated drawer total"
          icon={WalletCards}
          tone="amber"
        />
        <StatCard
          title="Open balances"
          value={`${bookingsWithOpenBalance.length}`}
          detail={`${formatMoney(openBalanceTotalMad, "MAD")} still due in MAD bookings`}
          icon={CreditCard}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming arrivals</CardTitle>
            <Badge variant="secondary">{property?.name ?? "Riad Al Fes"}</Badge>
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
                {upcomingBookings.slice(0, 5).map((booking) => {
                  const room = rooms.find((item) => item.id === booking.roomId)
                  const balance = getBookingBalance(booking, paymentTotals)

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.guestName}</TableCell>
                      <TableCell>{room?.name}</TableCell>
                      <TableCell>
                        {booking.checkIn} to {booking.checkOut}
                      </TableCell>
                      <TableCell className="text-right">
                        {balance > 0
                          ? formatMoney(balance, booking.currency)
                          : "Paid"}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {upcomingBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No upcoming arrivals.
                    </TableCell>
                  </TableRow>
                ) : null}
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
                  Current MAD drawer position is{" "}
                  <span className="font-medium text-foreground">
                    {formatMoney(cashPositionMad, "MAD")}
                  </span>
                  .
                </p>
                <div className="space-y-2">
                  {recentCashMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="truncate text-muted-foreground">
                        {movement.date} · {movement.type}
                      </span>
                      <span className="font-medium">
                        {formatMoney(movement.amount, "MAD")}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="invoices" className="mt-4 space-y-3 text-sm">
                <p className="leading-6 text-muted-foreground">
                  There are{" "}
                  <span className="font-medium text-foreground">
                    {draftInvoiceCount}
                  </span>{" "}
                  invoice drafts waiting for review.
                </p>
                <Badge variant="outline">
                  {invoices.length} invoices total
                </Badge>
              </TabsContent>
              <TabsContent value="export" className="mt-4 space-y-3 text-sm">
                <p className="leading-6 text-muted-foreground">
                  The owner should always be able to export clean CSV records
                  for bookings, guests, payments, invoices, and cash.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ExportCsvButton dataset="bookings" label="Bookings CSV" />
                  <ExportCsvButton dataset="guests" label="Guests CSV" />
                  <ExportCsvButton dataset="payments" label="Payments CSV" />
                  <ExportCsvButton dataset="invoices" label="Invoices CSV" />
                  <ExportCsvButton
                    dataset="cash-movements"
                    label="Cash CSV"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
