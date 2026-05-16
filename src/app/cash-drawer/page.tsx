import { CashDrawerManager } from "@/components/cash-drawer/cash-drawer-manager"
import { ExportCsvButton } from "@/components/export-csv-button"
import { PageHeader } from "@/components/layout/page-header"
import { getCashMovements } from "@/lib/data"
import { translate } from "@/lib/i18n"
import { getRequestLocale } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function CashDrawerPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translate(locale, text)
  const cashMovements = await getCashMovements()

  return (
    <>
      <PageHeader
        eyebrow={t("Daily cash")}
        title={t("Cash Drawer")}
        description={t("Track opening balance, cash in, cash out, and expected closing balance for each day.")}
        action={<ExportCsvButton dataset="cash-movements" label={t("Export CSV")} />}
      />
      <CashDrawerManager movements={cashMovements} />
    </>
  )
}
