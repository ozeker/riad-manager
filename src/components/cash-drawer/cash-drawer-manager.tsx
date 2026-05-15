"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
      toast.error("Date and category are required.")
      return
    }

    if (Number(draft.amount) < 0) {
      toast.error("Amount cannot be negative.")
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
        throw new Error("Could not save cash movement.")
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
      toast.success(draft.id ? "Cash movement updated" : "Cash movement added")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("The cash movement could not be saved.")
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
        throw new Error("Could not delete cash movement.")
      }

      setMovements((current) =>
        current.filter((item) => item.id !== movement.id)
      )
      toast.success("Cash movement deleted")
      router.refresh()
    } catch {
      toast.error("The cash movement could not be deleted.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="drawerDate" className="text-sm text-muted-foreground">
            Date
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
          Cash movement
        </Button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <Card className="rounded-lg border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Opening balance
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
              Cash in
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
              Cash out
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
              Expected closing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatMoney(dailyTotals.expectedClosingBalance, "MAD")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Recorded: {formatMoney(dailyTotals.recordedClosingBalance, "MAD")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-border/80 shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Badge variant="outline">{movement.type}</Badge>
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
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteMovement(movement)}
                          disabled={deletingId === movement.id}
                        >
                          <Trash2 className="size-4" />
                          {deletingId === movement.id ? "Deleting..." : "Delete"}
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
                    No cash movements for this date.
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
              {draft.id ? "Edit cash movement" : "Cash movement"}
            </DialogTitle>
            <DialogDescription>
              Cash drawer entries are MAD-only for this milestone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="movementDate">Date</Label>
              <Input
                id="movementDate"
                type="date"
                value={draft.date}
                onChange={(event) => updateDraft("date", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={draft.type}
                onValueChange={(type: CashMovement["type"]) =>
                  updateDraft("type", type)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="amount">Amount MAD</Label>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={draft.notes}
                placeholder="Supplier name, receipt number, or reconciliation note"
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
              Cancel
            </Button>
            <Button onClick={saveMovement} disabled={saving}>
              {saving ? "Saving..." : "Save movement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
