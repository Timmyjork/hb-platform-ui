import React from 'react'

type Props = {
  title: string
  onExport?: () => void
  onDelete?: () => void
  children: React.ReactNode
}

export default function WidgetFrame({ title, onExport, onDelete, children }: Props) {
  return (
    <div className="h-full w-full rounded-lg border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--divider)] px-2 py-1 text-sm">
        <div className="truncate font-medium">{title}</div>
        <div className="flex items-center gap-1">
          {onExport && <button className="rounded border px-2 py-0.5" onClick={onExport}>Export</button>}
          {onDelete && <button className="rounded border px-2 py-0.5" onClick={onDelete}>Delete</button>}
        </div>
      </div>
      <div className="p-2">{children}</div>
    </div>
  )
}

