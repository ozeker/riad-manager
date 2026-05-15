"use client"

import { Bell, Search } from "lucide-react"

import { AppSidebar, MobileNav } from "@/components/layout/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <MobileNav />
              <div className="hidden items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground lg:flex">
                <Search className="size-4" />
                <span>Search bookings, guests, invoices</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Bell className="size-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span className="flex size-5 items-center justify-center rounded bg-emerald-100 text-xs font-semibold text-emerald-800">
                      RA
                    </span>
                    <span className="hidden sm:inline">Owner</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Riad Al Fes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>Single owner mode</DropdownMenuItem>
                  <DropdownMenuItem disabled>Mock prototype</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
