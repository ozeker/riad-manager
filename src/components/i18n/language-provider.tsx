"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

import {
  getLanguageLabel,
  isLocale,
  languageCookieName,
  locales,
  Locale,
  translate,
} from "@/lib/i18n"

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (text: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (!locales.includes(nextLocale)) return

      document.cookie = `${languageCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.lang = nextLocale
      window.localStorage.setItem(languageCookieName, nextLocale)
      setLocaleState(nextLocale)
      router.refresh()
    },
    [router]
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (text) => translate(locale, text),
    }),
    [locale, setLocale]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.")
  }

  return context
}

export function readStoredLocale(value: string | null): Locale | null {
  return isLocale(value ?? undefined) ? (value as Locale) : null
}

export { getLanguageLabel }
