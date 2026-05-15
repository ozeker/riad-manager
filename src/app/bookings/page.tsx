import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatMoney } from "@/lib/format"
import { getBookings, getRooms } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function BookingsPage() {
  const [bookings, rooms] = await Promise.all([getBookings(), getRooms()])

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="A simple list view for manual reservations and imported read-only bookings."
        action={<Button>New booking</Button>}
      />
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stay</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const room = rooms.find((item) => item.id === booking.roomId)

                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.guestName}</TableCell>
                    <TableCell>{room?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.source}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{booking.status}</TableCell>
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
    </>
  )
}
