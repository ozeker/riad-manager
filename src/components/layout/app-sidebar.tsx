"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  Hotel,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  WalletCards,
} from "lucide-react"
import { useState } from "react"

import { useLanguage } from "@/components/i18n/language-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/cash-drawer", label: "Cash Drawer", icon: WalletCards },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname.startsWith(href)
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
        <Hotel className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Riad Manager</p>
        <p className="truncate text-xs text-muted-foreground">Riad Al Fes</p>
      </div>
    </Link>
  )
}

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{t(item.label)}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter() {
  const { t } = useLanguage()

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{t("Owner app")}</p>
        <Badge variant="secondary">{t("Local MVP")}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {t("Single-owner access is enabled. Keep the owner password and auth secret private before deployment.")}
      </p>
    </div>
  )
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card/80 md:flex md:min-h-screen md:flex-col">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col justify-between gap-6 p-4">
        <SidebarLinks />
        <SidebarFooter />
      </div>
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="size-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle asChild>
            <Brand />
          </SheetTitle>
        </SheetHeader>
        <div className="flex h-[calc(100vh-73px)] flex-col justify-between gap-6 p-4">
          <SidebarLinks onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  )
}
