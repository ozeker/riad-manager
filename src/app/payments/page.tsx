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
import { payments } from "@/lib/mock-data"

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Money"
        title="Payments"
        description="Each booking can have multiple payments across cash, card, bank transfer, OTA prepaid, or other."
        action={<Button>Record payment</Button>}
      />
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.guestName}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.method}</Badge>
                  </TableCell>
                  <TableCell>{payment.notes}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(payment.amount, payment.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
