"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useLanguage } from "@/components/i18n/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { formatMoney } from "@/lib/format"
import type { CashMovement } from "@/lib/types"

type CashMovementDraft = Omit<CashMovement, "id" | "currency"> & {
  id?: string
  currency?: "MAD"
}

type CashDrawerManagerProps = {
  movements: CashMovement[]
}

const movementTypes: CashMovement["type"][] = [
  "opening balance",
  "cash in",
  "cash out",
  "closing balance",
]

const cashOutCategories = [
  "supplier",
  "staff",
  "maintenance",
  "food",
  "cleaning",
  "owner withdrawal",
  "other",
]

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function createEmptyMovement(date: string): CashMovementDraft {
  return {
    date,
    type: "cash in",
    category: "room payment",
    amount: 0,
    currency: "MAD",
    notes: "",
  }
}

function getDailyTotals(movements: CashMovement[]) {
  const openingBalance = movements
    .filter((movement) => movement.type === "opening balance")
    .reduce((sum, movement) => sum + movement.amount, 0)
  const cashIn = movements
    .filter((movement) => movement.type === "cash in")
    .reduce((sum, movement) => sum + movement.amount, 0)
  const cashOut = movements
    .filter((movement) => movement.type === "cash out")
    .reduce((sum, movement) => sum + movement.amount, 0)
  const recordedClosingBalance = movements
    .filter((movement) => movement.type === "closing balance")
    .reduce((sum, movement) => sum + movement.amount, 0)
  const expectedClosingBalance = openingBalance + cashIn - cashOut

  return {
    openingBalance,
    cashIn,
    cashOut,
    recordedClosingBalance,
    expectedClosingBalance,
  }
}

export function CashDrawerManager({
  movements: initialMovements,
}: CashDrawerManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [movements, setMovements] = useState(initialMovements)
  const [selectedDate, setSelectedDate] = useState(
    initialMovements[0]?.date ?? todayString()
  )
  const [draft, setDraft] = useState<CashMovementDraft>(() =>
    createEmptyMovement(selectedDate)
  )
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const dailyMovements = useMemo(
    () =>
      movements
        .filter((movement) => movement.date === selectedDate)
        .sort((left, right) => left.type.localeCompare(right.type)),
    [movements, selectedDate]
  )

  const dailyTotals = useMemo(
    () => getDailyTotals(dailyMovements),
    [dailyMovements]
  )

  const dates = useMemo(
    () =>
      Array.from(new Set(movements.map((movement) => movement.date))).sort(),
    [movements]
  )

  function openCreate() {
    setDraft(createEmptyMovement(selectedDate))
    setOpen(true)
  }

  function openEdit(movement: CashMovement) {
    setDraft(movement)
    setOpen(true)
  }

  function updateDraft<K extends keyof CashMovementDraft>(
    key: K,
    value: CashMovementDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function saveMovement() {
    if (!draft.date || !draft.category.trim()) {
      toast.error(t("Date and category are required."))
      return
    }

    if (Number(draft.amount) < 0) {
      toast.error(t("Amount cannot be negative."))
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/cash-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        throw new Error(t("Could not save cash movement."))
      }

      const savedMovement = (await response.json()) as CashMovement

      setMovements((current) => {
        const exists = current.some((movement) => movement.id === savedMovement.id)
        if (exists) {
          return current.map((movement) =>
            movement.id === savedMovement.id ? savedMovement : movement
          )
        }

        return [...current, savedMovement]
      })

      setSelectedDate(savedMovement.date)
      toast.success(draft.id ? t("Cash movement updated") : t("Cash movement added"))
      setOpen(false)
      router.refresh()
    } catch {
      toast.error(t("The cash movement could not be saved."))
    } finally {
      setSaving(false)
    }
  }

  async function deleteMovement(movement: CashMovement) {
    setDeletingId(movement.id)
    try {
      const response = await fetch(`/api/cash-movements?id=${movement.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("Could not delete cash movement."))
      }

      setMovements((current) =>
        current.filter((item) => item.id !== movement.id)
      )
      toast.success(t("Cash movement deleted"))
      router.refresh()
    } catch {
      toast.error(t("The cash movement could not be deleted."))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="drawerDate" className="text-sm text-muted-foreground">
            {t("Date")}
          </Label>
          <Input
            id="drawerDate"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-44 bg-background"
            list="cash-drawer-dates"
          />
          <datalist id="cash-drawer-dates">
            {dates.map((date) => (
              <option key={date} value={date} />
            ))}
          </datalist>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t("Cash movement")}
        </Button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("Opening balance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatMoney(dailyTotals.openingBalance, "MAD")}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("Cash in")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-emerald-700">
              {formatMoney(dailyTotals.cashIn, "MAD")}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("Cash out")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight text-rose-700">
              {formatMoney(dailyTotals.cashOut, "MAD")}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("Expected closing")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatMoney(dailyTotals.expectedClosingBalance, "MAD")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("Recorded")}: {formatMoney(dailyTotals.recordedClosingBalance, "MAD")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Type")}</TableHead>
                <TableHead>{t("Category")}</TableHead>
                <TableHead>{t("Notes")}</TableHead>
                <TableHead className="text-right">{t("Amount")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Badge variant="outline">{t(movement.type)}</Badge>
                  </TableCell>
                  <TableCell>{movement.category}</TableCell>
                  <TableCell>{movement.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(movement.amount, "MAD")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">
                            Cash movement actions for {movement.category}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(movement)}>
                          <Pencil className="size-4" />
                          {t("Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteMovement(movement)}
                          disabled={deletingId === movement.id}
                        >
                          <Trash2 className="size-4" />
                          {deletingId === movement.id ? t("Deleting...") : t("Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {dailyMovements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("No cash movements for this date.")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? t("Edit cash movement") : t("Cash movement")}
            </DialogTitle>
            <DialogDescription>
              {t("Cash drawer entries are MAD-only for this milestone.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movementDate">{t("Date")}</Label>
              <Input
                id="movementDate"
                type="date"
                value={draft.date}
                onChange={(event) => updateDraft("date", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Type")}</Label>
              <Select
                value={draft.type}
                onValueChange={(type: CashMovement["type"]) =>
                  updateDraft("type", type)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Type")} />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("Category")}</Label>
              <Input
                id="category"
                value={draft.category}
                list="cash-categories"
                placeholder="supplier"
                onChange={(event) => updateDraft("category", event.target.value)}
              />
              <datalist id="cash-categories">
                {cashOutCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("Amount MAD")}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={draft.amount}
                onChange={(event) =>
                  updateDraft("amount", Number(event.target.value))
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
              <Textarea
                id="notes"
                value={draft.notes}
                placeholder={t("Supplier name, receipt number, or reconciliation note")}
                onChange={(event) => updateDraft("notes", event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              {t("Cancel")}
            </Button>
            <Button onClick={saveMovement} disabled={saving}>
              {saving ? t("Saving...") : t("Save movement")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
