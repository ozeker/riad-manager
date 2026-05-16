"use client"

import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLanguageLabel, useLanguage } from "@/components/i18n/language-provider"
import { locales } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Languages className="size-4" />
          <span className="hidden sm:inline">{getLanguageLabel(locale)}</span>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => setLocale(item)}
            disabled={item === locale}
          >
            {getLanguageLabel(item)}
            {item === locale ? ` (${t("Language")})` : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
