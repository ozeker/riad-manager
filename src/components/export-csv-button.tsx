import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

type ExportCsvButtonProps = {
  dataset:
    | "bookings"
    | "guests"
    | "payments"
    | "invoices"
    | "cash-movements"
  label?: string
}

export function ExportCsvButton({
  dataset,
  label = "Export CSV",
}: ExportCsvButtonProps) {
  return (
    <Button asChild variant="outline">
      <a href={`/api/export?dataset=${dataset}`}>
        <Download className="size-4" />
        {label}
      </a>
    </Button>
  )
}
