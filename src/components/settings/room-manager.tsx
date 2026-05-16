"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatMoney } from "@/lib/format"
import type { Room } from "@/lib/types"

type RoomDraft = Omit<Room, "id"> & { id?: string }

type RoomManagerProps = {
  rooms: Room[]
}

const emptyRoom: RoomDraft = {
  name: "",
  capacity: 2,
  rates: {
    MAD: 0,
    EUR: 0,
    USD: 0,
  },
  active: true,
}

export function RoomManager({ rooms: initialRooms }: RoomManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [rooms, setRooms] = useState(initialRooms)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<RoomDraft>(emptyRoom)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setDraft(emptyRoom)
    setOpen(true)
  }

  function openEdit(room: Room) {
    setDraft(room)
    setOpen(true)
  }

  function updateDraft<K extends keyof RoomDraft>(key: K, value: RoomDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateRate(currency: keyof Room["rates"], value: number) {
    setDraft((current) => ({
      ...current,
      rates: {
        ...current.rates,
        [currency]: value,
      },
    }))
  }

  async function persistRoom(nextDraft: RoomDraft) {
    if (!nextDraft.name.trim()) {
      toast.error(t("Room name is required."))
      throw new Error("Room name is required.")
    }

    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextDraft),
    })

    if (!response.ok) {
      throw new Error(t("Could not save room."))
    }

    const savedRoom = (await response.json()) as Room

    setRooms((current) => {
      const exists = current.some((room) => room.id === savedRoom.id)
      if (exists) {
        return current.map((room) =>
          room.id === savedRoom.id ? savedRoom : room
        )
      }

      return [...current, savedRoom]
    })

    router.refresh()
    return savedRoom
  }

  async function saveRoom(nextDraft = draft) {
    setSaving(true)
    try {
      await persistRoom(nextDraft)
      toast.success(nextDraft.id ? t("Room updated") : t("Room created"))
      setOpen(false)
    } catch (error) {
      if (error instanceof Error && error.message === "Room name is required.") {
        return
      }
      toast.error(t("The room could not be saved."))
    } finally {
      setSaving(false)
    }
  }

  async function toggleRoom(room: Room, active: boolean) {
    const nextRoom = { ...room, active }
    setRooms((current) =>
      current.map((item) => (item.id === room.id ? nextRoom : item))
    )

    try {
      await persistRoom(nextRoom)
      toast.success(active ? t("Room activated") : t("Room deactivated"))
    } catch {
      setRooms((current) =>
        current.map((item) => (item.id === room.id ? room : item))
      )
      toast.error(t("The room status could not be saved."))
    }
  }

  return (
    <>
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">{t("Rooms")}</CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            {t("Add room")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Room")}</TableHead>
                <TableHead>{t("Capacity")}</TableHead>
                <TableHead>{t("Rates")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="w-28 text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {formatMoney(room.rates.MAD, "MAD")}
                      </Badge>
                      <Badge variant="outline">
                        {formatMoney(room.rates.EUR, "EUR")}
                      </Badge>
                      <Badge variant="outline">
                        {formatMoney(room.rates.USD, "USD")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={room.active}
                        onCheckedChange={(active) => toggleRoom(room, active)}
                        aria-label={`Set ${room.name} active status`}
                      />
                      <Badge variant={room.active ? "secondary" : "outline"}>
                        {room.active ? t("Active") : t("Inactive")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(room)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">{t("Edit")} {room.name}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? t("Edit room") : t("Add room")}</DialogTitle>
            <DialogDescription>
              {t("Room changes are saved to the PostgreSQL database.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="roomName">{t("Room name")}</Label>
              <Input
                id="roomName"
                value={draft.name}
                placeholder="Zellij Suite"
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">{t("Capacity")}</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={draft.capacity}
                onChange={(event) =>
                  updateDraft("capacity", Number(event.target.value))
                }
              />
            </div>

            <div className="flex items-end justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-1">
                <Label htmlFor="active">{t("Active")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("Active rooms appear on the calendar.")}
                </p>
              </div>
              <Switch
                id="active"
                checked={draft.active}
                onCheckedChange={(active) => updateDraft("active", active)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateMad">{t("MAD rate")}</Label>
              <Input
                id="rateMad"
                type="number"
                min="0"
                value={draft.rates.MAD}
                onChange={(event) => updateRate("MAD", Number(event.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateEur">{t("EUR rate")}</Label>
              <Input
                id="rateEur"
                type="number"
                min="0"
                value={draft.rates.EUR}
                onChange={(event) => updateRate("EUR", Number(event.target.value))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rateUsd">{t("USD rate")}</Label>
              <Input
                id="rateUsd"
                type="number"
                min="0"
                value={draft.rates.USD}
                onChange={(event) => updateRate("USD", Number(event.target.value))}
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
            <Button onClick={() => saveRoom()} disabled={saving}>
              {saving ? t("Saving...") : t("Save room")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
