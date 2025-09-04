import { useMemo, useState } from 'react'
import { listByQueen, addReview } from '../reviews/store'
import { listQuestions, addQuestion } from '../qa/store'
import { useAuth } from '../auth/useAuth'
import { setMeta } from '../utils/seo'

export default function PublicQueenCard({ queenId = 'UA.7.45.1.25.2025' }: { queenId?: string }) {
  const { user } = useAuth()
  const [seed, setSeed] = useState(0)
  const reviews = useMemo(()=> listByQueen(queenId).filter(r=> r.status==='published'), [queenId, seed])
  const questions = useMemo(()=> listQuestions('queen', queenId), [queenId, seed])
  const avg = reviews.length ? reviews.reduce((s,r)=> s + r.rating, 0) / reviews.length : 0
  setMeta({ title: `Матка ${queenId} — рейтинг ${avg.toFixed(1)}` })

  function onAddReview(e: React.FormEvent) {
    e.preventDefault(); if (!user) { alert('Увійдіть'); return }
    const form = e.target as HTMLFormElement; const data = new FormData(form)
    const rating = Number(data.get('rating')||5) as 1|2|3|4|5
    const text = String(data.get('text')||'')
    addReview({ queenId, breederId: 'B1', authorId: user.id, rating, text }); setSeed(x=>x+1); form.reset()
  }
  function onAddQuestion(e: React.FormEvent) {
    e.preventDefault(); if (!user) { alert('Увійдіть'); return }
    const form = e.target as HTMLFormElement; const data = new FormData(form)
    const text = String(data.get('q')||'')
    addQuestion({ context:'queen', contextId: queenId, authorId: user.id, text }); setSeed(x=>x+1); form.reset()
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Публічна картка: {queenId}</h1>
      <div className="mt-2 text-sm">Рейтинг: <b>{avg.toFixed(1)}</b> ({reviews.length})</div>
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold">Відгуки</h2>
          <ul className="space-y-2">{reviews.map(r => (<li key={r.id} className="rounded border p-2"><div className="text-xs">{r.rating}★</div><div className="text-sm">{r.text}</div></li>))}</ul>
          <form className="mt-3 space-y-2" onSubmit={onAddReview}>
            <select name="rating" className="w-full rounded border px-2 py-1 text-sm">{[5,4,3,2,1].map(n=> <option key={n} value={n}>{n} зірок</option>)}</select>
            <textarea name="text" required className="w-full rounded border px-2 py-1 text-sm" placeholder="Ваш відгук" />
            <button className="rounded-md border px-3 py-1.5 text-sm">Надіслати</button>
          </form>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-semibold">Питання</h2>
          <ul className="space-y-2">{questions.map(q => (<li key={q.id} className="rounded border p-2"><div className="text-xs">{new Date(q.createdAt).toLocaleString()}</div><div className="text-sm">{q.text}</div></li>))}</ul>
          <form className="mt-3 space-y-2" onSubmit={onAddQuestion}>
            <input name="q" required className="w-full rounded border px-2 py-1 text-sm" placeholder="Ваше питання" />
            <button className="rounded-md border px-3 py-1.5 text-sm">Запитати</button>
          </form>
        </section>
      </div>
    </div>
  )
}
