import type { Currency } from "@/lib/types"

export function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "MAD" ? 0 : 2,
  }).format(amount)
}
