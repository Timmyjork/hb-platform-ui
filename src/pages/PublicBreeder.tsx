import { useMemo, useState } from 'react'
import { listByBreeder, addReview } from '../reviews/store'
import type { Review } from '../reviews/types'
import { listQuestions, addQuestion } from '../qa/store'
import { listQueens } from '../state/queens.store'
import { useAuth } from '../auth/useAuth'
import { setMeta } from '../utils/seo'

export default function PublicBreeder({ breederId = 'B1' }: { breederId?: string }) {
  const { user, role } = useAuth()
  const [seed, setSeed] = useState(0)
  const reviews = useMemo(()=> listByBreeder(breederId).filter(r=> r.status==='published'), [breederId, seed])
  const questions = useMemo(()=> listQuestions('breeder', breederId), [breederId, seed])
  const avg = reviews.length ? reviews.reduce((s,r)=> s + r.rating, 0) / reviews.length : 0
  setMeta({ title: `Профіль маткаря ${breederId} — рейтинг ${avg.toFixed(1)}` })
  const owned = useMemo(()=> listQueens().some(q => q.breederId === breederId && q.ownerUserId === user?.id), [breederId, user])

  function onAddReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { alert('Увійдіть для відгуку'); return }
    if (role !== 'buyer' || !owned) { alert('Лишати відгуки можуть лише покупці'); return }
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    const rating = Number(data.get('rating')||5) as Review['rating']
    const text = String(data.get('text')||'')
    addReview({ breederId, authorId: user.id, rating, text })
    setSeed(x=>x+1); form.reset()
  }

  function onAddQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { alert('Увійдіть, щоб поставити питання'); return }
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    const text = String(data.get('q')||'')
    addQuestion({ context:'breeder', contextId: breederId, authorId: user.id, text })
    setSeed(x=>x+1); form.reset()
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Публічний профіль маткаря {breederId}</h1>
      <div className="mt-2 text-sm">Рейтинг: <b>{avg.toFixed(1)}</b> із {reviews.length} відгуків</div>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold">Відгуки</h2>
          <ul className="space-y-2">
            {reviews.map(r => (
              <li key={r.id} className="rounded border p-2">
                <div className="text-xs text-[var(--secondary)]">{new Date(r.createdAt).toLocaleDateString()} • {r.rating}★</div>
                <div className="text-sm">{r.text}</div>
              </li>
            ))}
          </ul>
          <form className="mt-3 space-y-2" onSubmit={onAddReview}>
            <div className="text-xs text-[var(--secondary)]">Залишити відгук (тільки покупці)</div>
            <select name="rating" className="w-full rounded border px-2 py-1 text-sm">
              {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n} зірок</option>)}
            </select>
            <textarea name="text" required className="w-full rounded border px-2 py-1 text-sm" placeholder="Ваш відгук" />
            <button className="rounded-md border px-3 py-1.5 text-sm">Надіслати</button>
          </form>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-semibold">Питання</h2>
          <ul className="space-y-2">
            {questions.map(q => (
              <li key={q.id} className="rounded border p-2">
                <div className="text-xs text-[var(--secondary)]">{new Date(q.createdAt).toLocaleString()}</div>
                <div className="text-sm">{q.text}</div>
              </li>
            ))}
          </ul>
          <form className="mt-3 space-y-2" onSubmit={onAddQuestion}>
            <div className="text-xs text-[var(--secondary)]">Поставити питання</div>
            <input name="q" required className="w-full rounded border px-2 py-1 text-sm" placeholder="Ваше питання" />
            <button className="rounded-md border px-3 py-1.5 text-sm">Запитати</button>
          </form>
        </section>
      </div>
    </div>
  )
}
