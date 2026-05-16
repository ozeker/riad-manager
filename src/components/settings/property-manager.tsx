"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Currency, Property } from "@/lib/types"

type PropertyDraft = Property

type PropertyManagerProps = {
  property: Property | null
}

const currencies: Currency[] = ["MAD", "EUR", "USD"]

const fallbackProperty: Property = {
  id: "property-riad-al-fes",
  name: "Riad Al Fes",
  legalName: "Riad Al Fes SARL",
  address: "23 Derb Zellij, Fes Medina",
  city: "Fes",
  country: "Morocco",
  phone: "+212 600 000 000",
  ice: "001234567000089",
  logoUrl: "",
  defaultCurrency: "MAD",
  touristTaxMadPerPersonNight: 30,
  vatRatePercent: 10,
}

function propertyValue(property: Property | null) {
  return property ?? fallbackProperty
}

export function PropertyManager({ property: initialProperty }: PropertyManagerProps) {
  const router = useRouter()
  const [property, setProperty] = useState(propertyValue(initialProperty))
  const [draft, setDraft] = useState<PropertyDraft>(property)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function openEdit() {
    setDraft(property)
    setOpen(true)
  }

  function updateDraft<K extends keyof PropertyDraft>(
    key: K,
    value: PropertyDraft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function saveProperty() {
    if (
      !draft.name.trim() ||
      !draft.legalName.trim() ||
      !draft.address.trim() ||
      !draft.city.trim() ||
      !draft.country.trim() ||
      !draft.phone.trim() ||
      !draft.ice.trim()
    ) {
      toast.error("Property details are required.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      })

      if (!response.ok) {
        throw new Error("Could not save property.")
      }

      const savedProperty = (await response.json()) as Property
      setProperty(savedProperty)
      toast.success("Property settings updated")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("The property settings could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card className="rounded-lg border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Property</CardTitle>
          <Button size="sm" variant="outline" onClick={openEdit}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{property.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Legal name</span>
            <span className="font-medium">{property.legalName}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Invoice address</span>
            <span className="max-w-[18rem] text-right font-medium">
              {property.address}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">
              {property.city}, {property.country}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{property.phone}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">ICE</span>
            <span className="font-medium">{property.ice}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Logo URL</span>
            <span className="max-w-[18rem] truncate text-right font-medium">
              {property.logoUrl || "Not set"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Default currency</span>
            <span className="font-medium">{property.defaultCurrency}</span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Tourist tax</span>
            <span className="font-medium">
              {property.touristTaxMadPerPersonNight} MAD / person / night
            </span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">VAT rate</span>
            <span className="font-medium">{property.vatRatePercent}%</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit property</DialogTitle>
            <DialogDescription>
              These details are used on invoice drafts, exports, and the owner
              dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Name</Label>
              <Input
                id="propertyName"
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Legal name</Label>
              <Input
                id="legalName"
                value={draft.legalName}
                onChange={(event) => updateDraft("legalName", event.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Invoice address</Label>
              <Input
                id="address"
                value={draft.address}
                onChange={(event) => updateDraft("address", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={draft.city}
                onChange={(event) => updateDraft("city", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={draft.country}
                onChange={(event) => updateDraft("country", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={draft.phone}
                onChange={(event) => updateDraft("phone", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ice">ICE</Label>
              <Input
                id="ice"
                value={draft.ice}
                onChange={(event) => updateDraft("ice", event.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={draft.logoUrl}
                placeholder="https://example.com/logo.png"
                onChange={(event) => updateDraft("logoUrl", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Default currency</Label>
              <Select
                value={draft.defaultCurrency}
                onValueChange={(currency: Currency) =>
                  updateDraft("defaultCurrency", currency)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="touristTax">Tourist tax MAD</Label>
              <Input
                id="touristTax"
                type="number"
                min="0"
                value={draft.touristTaxMadPerPersonNight}
                onChange={(event) =>
                  updateDraft(
                    "touristTaxMadPerPersonNight",
                    Number(event.target.value)
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatRate">VAT rate percent</Label>
              <Input
                id="vatRate"
                type="number"
                min="0"
                value={draft.vatRatePercent}
                onChange={(event) =>
                  updateDraft("vatRatePercent", Number(event.target.value))
                }
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
            <Button onClick={saveProperty} disabled={saving}>
              {saving ? "Saving..." : "Save property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
