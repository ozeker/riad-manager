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
import { getCashMovements } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function CashDrawerPage() {
  const cashMovements = await getCashMovements()

  return (
    <>
      <PageHeader
        eyebrow="Daily cash"
        title="Cash Drawer"
        description="Track opening balance, cash in, cash out, and closing balance for the day."
        action={<Button>Cash movement</Button>}
      />
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{movement.type}</Badge>
                  </TableCell>
                  <TableCell>{movement.category}</TableCell>
                  <TableCell>{movement.notes}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(movement.amount, movement.currency)}
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
