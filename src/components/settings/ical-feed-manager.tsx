"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  LinkIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { IcalFeed, Room } from "@/lib/types"

type IcalFeedDraft = Omit<IcalFeed, "id" | "lastSyncedAt"> & {
  id?: string
  lastSyncedAt?: string
}

type IcalFeedManagerProps = {
  feeds: IcalFeed[]
  rooms: Room[]
}

type IcalImportResult = {
  imported: number
  updated: number
  skipped: number
  errors: number
  results: {
    feedId: string
    feedName: string
    imported: number
    updated: number
    skipped: number
    error?: string
  }[]
}

const sources: IcalFeed["source"][] = [
  "Booking.com",
  "Airbnb",
  "HotelRunner",
  "Other",
]

const emptyFeed: IcalFeedDraft = {
  name: "",
  source: "Booking.com",
  roomId: "",
  roomName: "",
  url: "",
  active: true,
  lastImportStatus: "",
  lastImportMessage: "",
  lastImportImported: 0,
  lastImportUpdated: 0,
  lastImportSkipped: 0,
  lastImportErrors: 0,
}

function formatLastSynced(value: string) {
  if (!value) {
    return "Never"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function statusVariant(status: IcalFeed["lastImportStatus"]) {
  if (status === "success") return "secondary"
  if (status === "partial") return "default"
  if (status === "error") return "outline"
  return "outline"
}

export function IcalFeedManager({
  feeds: initialFeeds,
  rooms,
}: IcalFeedManagerProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [feeds, setFeeds] = useState(initialFeeds)
  const [draft, setDraft] = useState<IcalFeedDraft>(emptyFeed)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openCreate() {
    setDraft(emptyFeed)
    setOpen(true)
  }

  function openEdit(feed: IcalFeed) {
    setDraft(feed)
    setOpen(true)
  }

  function updateDraft<K extends keyof IcalFeedDraft>(
    key: K,
    value: IcalFeedDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function persistFeed(nextDraft: IcalFeedDraft) {
    if (!nextDraft.name.trim() || !nextDraft.url.trim()) {
      toast.error(t("Feed name and URL are required."))
      throw new Error("Feed name and URL are required.")
    }

    const response = await fetch("/api/ical-feeds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextDraft),
    })

    if (!response.ok) {
      throw new Error(t("Could not save iCal feed."))
    }

    const savedFeed = (await response.json()) as IcalFeed

    setFeeds((current) => {
      const exists = current.some((feed) => feed.id === savedFeed.id)
      if (exists) {
        return current.map((feed) =>
          feed.id === savedFeed.id ? savedFeed : feed
        )
      }

      return [...current, savedFeed]
    })

    router.refresh()
    return savedFeed
  }

  async function saveFeed(nextDraft = draft) {
    setSaving(true)
    try {
      await persistFeed(nextDraft)
      toast.success(nextDraft.id ? t("iCal feed updated") : t("iCal feed added"))
      setOpen(false)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Feed name and URL are required."
      ) {
        return
      }
      toast.error(t("The iCal feed could not be saved."))
    } finally {
      setSaving(false)
    }
  }

  async function toggleFeed(feed: IcalFeed, active: boolean) {
    const nextFeed = { ...feed, active }
    setFeeds((current) =>
      current.map((item) => (item.id === feed.id ? nextFeed : item))
    )

    try {
      await persistFeed(nextFeed)
      toast.success(active ? t("iCal feed activated") : t("iCal feed paused"))
    } catch {
      setFeeds((current) =>
        current.map((item) => (item.id === feed.id ? feed : item))
      )
      toast.error(t("The iCal feed status could not be saved."))
    }
  }

  async function deleteFeed(feed: IcalFeed) {
    setDeletingId(feed.id)
    try {
      const response = await fetch(`/api/ical-feeds?id=${feed.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("Could not delete iCal feed."))
      }

      setFeeds((current) => current.filter((item) => item.id !== feed.id))
      toast.success(t("iCal feed deleted"))
      router.refresh()
    } catch {
      toast.error(t("The iCal feed could not be deleted."))
    } finally {
      setDeletingId(null)
    }
  }

  async function importFeeds(feedId?: string) {
    setImporting(true)
    try {
      const response = await fetch("/api/ical-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedId ? { feedId } : {}),
      })

      if (!response.ok) {
        throw new Error(t("Could not import iCal feeds."))
      }

      const result = (await response.json()) as IcalImportResult
      const message = `Imported ${result.imported}, updated ${result.updated}, skipped ${result.skipped}.`

      if (result.errors > 0) {
        toast.warning(`${message} ${result.errors} feed error(s).`)
      } else {
        toast.success(message)
      }
      router.refresh()
    } catch {
      toast.error(t("The iCal import could not be completed."))
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{t("iCal feeds")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Import read-only reservations from Booking.com, Airbnb, and HotelRunner.")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => importFeeds()}
              disabled={importing || feeds.length === 0}
            >
              <RefreshCw className="size-4" />
              {importing ? t("Importing...") : t("Import feeds")}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {t("Add feed")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Feed")}</TableHead>
                <TableHead>{t("Source")}</TableHead>
                <TableHead>{t("Room")}</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Last synced")}</TableHead>
                <TableHead>{t("Last result")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">{feed.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{feed.source}</Badge>
                  </TableCell>
                  <TableCell>{feed.roomName || t("Unassigned")}</TableCell>
                  <TableCell>
                    <a
                      href={feed.url}
                      className="inline-flex max-w-[20rem] items-center gap-1 truncate text-sm text-muted-foreground hover:text-foreground"
                      rel="noreferrer"
                      target="_blank"
                    >
                      <LinkIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{feed.url}</span>
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feed.active}
                        onCheckedChange={(active) => toggleFeed(feed, active)}
                        aria-label={`Set ${feed.name} active status`}
                      />
                      <Badge variant={feed.active ? "secondary" : "outline"}>
                        {feed.active ? t("Active") : t("Paused")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatLastSynced(feed.lastSyncedAt)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={statusVariant(feed.lastImportStatus)}>
                        {feed.lastImportStatus ? t(feed.lastImportStatus) : t("Never imported")}
                      </Badge>
                      {feed.lastImportMessage ? (
                        <p className="max-w-[16rem] truncate text-xs text-muted-foreground">
                          {feed.lastImportMessage}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">
                            iCal feed actions for {feed.name}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(feed)}>
                          <Pencil className="size-4" />
                          {t("Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => importFeeds(feed.id)}
                          disabled={importing || !feed.active}
                        >
                          <RefreshCw className="size-4" />
                          {t("Import this feed")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteFeed(feed)}
                          disabled={deletingId === feed.id}
                        >
                          <Trash2 className="size-4" />
                          {deletingId === feed.id ? t("Deleting...") : t("Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {feeds.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("No iCal feeds yet.")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? t("Edit iCal feed") : t("Add iCal feed")}</DialogTitle>
            <DialogDescription>
              {t("Active feeds can be imported from the Settings page.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="feedName">{t("Feed name")}</Label>
              <Input
                id="feedName"
                value={draft.name}
                placeholder="Booking.com reservations"
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Source")}</Label>
              <Select
                value={draft.source}
                onValueChange={(source: IcalFeed["source"]) =>
                  updateDraft("source", source)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Source")} />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                    {t(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t("Room")}</Label>
              <Select
                value={draft.roomId || "unassigned"}
                onValueChange={(roomId) =>
                  updateDraft("roomId", roomId === "unassigned" ? "" : roomId)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("Choose room")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">{t("Unassigned")}</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="feedUrl">iCal URL</Label>
              <Input
                id="feedUrl"
                type="url"
                value={draft.url}
                placeholder="https://example.com/calendar.ics"
                onChange={(event) => updateDraft("url", event.target.value)}
              />
            </div>

            <div className="flex items-end justify-between gap-4 rounded-lg border p-3 sm:col-span-2">
              <div className="space-y-1">
                <Label htmlFor="feedActive">{t("Active")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("Active feeds will be included when syncing is added.")}
                </p>
              </div>
              <Switch
                id="feedActive"
                checked={draft.active}
                onCheckedChange={(active) => updateDraft("active", active)}
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
            <Button onClick={() => saveFeed()} disabled={saving}>
              {saving ? t("Saving...") : t("Save feed")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
