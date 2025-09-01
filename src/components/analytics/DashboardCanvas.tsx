import React, { useCallback, useMemo, useRef, useState } from 'react'
import type { LayoutItem, WidgetBase } from '../../analytics/dashboards'
import WidgetFrame from './WidgetFrame'

type Props = {
  widgets: WidgetBase[]
  layout: LayoutItem[]
  onLayoutChange: (next: LayoutItem[]) => void
  renderWidget: (w: WidgetBase) => React.ReactNode
}

export default function DashboardCanvas({ widgets, layout, onLayoutChange, renderWidget }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragId, setDragId] = useState<string|undefined>()
  const [start, setStart] = useState<{mx:number; my:number; x:number; y:number}>()
  const items = useMemo(()=> new Map(layout.map(l=>[l.id,l])), [layout])

  const cols = 12

  const onPointerDown = useCallback((id: string, e: React.PointerEvent) => {
    const it = items.get(id); if (!it) return
    setDragId(id)
    setStart({ mx: e.clientX, my: e.clientY, x: it.x, y: it.y })
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }, [items])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragId || !start || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const gridW = rect.width / cols
    const dx = Math.round((e.clientX - start.mx)/gridW)
    const dy = Math.round((e.clientY - start.my)/24)
    const next = layout.map(l=> l.id===dragId? { ...l, x: Math.max(0, Math.min(cols - l.w, start.x + dx)), y: Math.max(0, start.y + dy) } : l)
    onLayoutChange(next)
  }, [dragId, start, cols, layout, onLayoutChange])

  const onPointerUp = useCallback(() => { setDragId(undefined); setStart(undefined) }, [])

  return (
    <div ref={ref} className="relative w-full" style={{ minHeight: 320 }} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      {widgets.map((w)=>{
        const l = items.get(w.id) || { id:w.id, x:0,y:0,w:4,h:6 }
        const left = `${(l.x/cols)*100}%`; const width = `${(l.w/cols)*100}%`; const top = l.y*24; const height = l.h*24
        return (
          <div key={w.id} className="absolute" style={{ left, top, width, height }}>
            <div onPointerDown={(e)=> onPointerDown(w.id, e)}>
              <WidgetFrame title={w.title}>{renderWidget(w)}</WidgetFrame>
            </div>
          </div>
        )
      })}
    </div>
  )
}

