import { CashDrawerManager } from "@/components/cash-drawer/cash-drawer-manager"
import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { getCashMovements } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function CashDrawerPage() {
  const cashMovements = await getCashMovements()

  return (
    <>
      <PageHeader
        eyebrow="Daily cash"
        title="Cash Drawer"
        description="Track opening balance, cash in, cash out, and expected closing balance for each day."
        action={<ExportCsvButton dataset="cash-movements" />}
      />
      <CashDrawerManager movements={cashMovements} />
    </>
  )
}
