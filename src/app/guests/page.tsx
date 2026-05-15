import { PageHeader } from "@/components/layout/page-header"
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
import { guests } from "@/lib/mock-data"

export default function GuestsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Guests"
        description="Guest history is kept editable so the owner can correct details after check-in."
        action={<Button variant="outline">Export CSV</Button>}
      />
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>ID / Passport</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.fullName}</TableCell>
                  <TableCell>{guest.phone}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{guest.nationality}</TableCell>
                  <TableCell>{guest.documentNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
