import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  badge?: string
  action?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  )
}
