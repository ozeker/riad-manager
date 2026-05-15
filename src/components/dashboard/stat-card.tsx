import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type StatCardProps = {
  title: string
  value: string
  detail: string
  icon: LucideIcon
  tone?: "neutral" | "green" | "blue" | "amber"
}

const toneClass = {
  neutral: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
}

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: StatCardProps) {
  return (
    <Card className="rounded-lg border-border/80 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
          <div className={`rounded-md p-2 ${toneClass[tone]}`}>
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
