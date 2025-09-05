import { useEffect, useRef } from "react"
import Analytics from "./Analytics"

export default function AnalyticsReadOnly() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const hideByText = (texts: string[]) => {
      const btns = Array.from(el.querySelectorAll('button')) as HTMLButtonElement[]
      for (const b of btns) {
        const t = (b.textContent || '').trim()
        if (texts.includes(t)) b.style.display = 'none'
      }
    }
    hideByText(['Експорт CSV','Експорт XLSX','Зберегти','Додати віджет','Delete','Save'])
    const inputs = Array.from(el.querySelectorAll('input, select, textarea')) as HTMLInputElement[]
    for (const i of inputs) {
      const isDate = i.type === 'month' || i.type === 'date'
      if (isDate) continue
      i.disabled = true
    }
  }, [])
  return (
    <div ref={ref}>
      <Analytics />
    </div>
  )
}
