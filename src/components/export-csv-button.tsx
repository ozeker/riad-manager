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
  from?: string
  to?: string
}

export function ExportCsvButton({
  dataset,
  label = "Export CSV",
  from,
  to,
}: ExportCsvButtonProps) {
  const params = new URLSearchParams({ dataset })

  if (from) params.set("from", from)
  if (to) params.set("to", to)

  return (
    <Button asChild variant="outline">
      <a href={`/api/export?${params.toString()}`}>
        <Download className="size-4" />
        {label}
      </a>
    </Button>
  )
}
