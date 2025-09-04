import { useMemo, useState } from 'react'
import { getBreeder } from '../state/breeders.store'
import { listReviews, addReview } from '../state/reviews.store'
import { listQuestions, askQuestion, answerQuestion } from '../state/qa.store'
import { useAuth } from '../auth/useAuth'
import { breederProfileToJSONLD } from '../seo/schema'
import { getBreederAggregateRating } from '../utils/breeder.helpers'

export default function BreederPublic({ breederId='B1' }: { breederId?: string }) {
  const profile = getBreeder(breederId)
  const { user, role } = useAuth()
  const [seed, setSeed] = useState(0)
  const reviews = useMemo(()=> listReviews(breederId), [breederId, seed])
  const qa = useMemo(()=> listQuestions(breederId), [breederId, seed])
  if (!profile) return <div className="p-4">Профіль не знайдено</div>
  const agg = getBreederAggregateRating(breederId)
  const jsonld = breederProfileToJSONLD(profile, { ratingAggregate: profile.ratingsPublic? agg: null }) as any

  function onSubmitReview(e: React.FormEvent) {
    e.preventDefault(); if (!user) { alert('Увійдіть'); return }
    const f = e.target as HTMLFormElement; const d = new FormData(f)
    addReview({ breederId, authorUserId: user.id, authorDisplay: user.name || user.email || 'User', rating: Number(d.get('rating')||5), text: String(d.get('text')||'') })
    setSeed(x=>x+1); f.reset()
  }
  function onAsk(e: React.FormEvent) {
    e.preventDefault(); if (!user) { alert('Увійдіть'); return }
    const f = e.target as HTMLFormElement; const d = new FormData(f)
    askQuestion({ breederId, authorUserId: user.id, text: String(d.get('q')||'') })
    setSeed(x=>x+1); f.reset()
  }

  return (
    <div className="p-4 space-y-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <header className="rounded-xl border p-4 bg-[var(--surface)]">
        <div className="text-xl font-semibold">{profile.displayName}</div>
        <div className="text-sm text-[var(--secondary)]">Регіон: {profile.regionCode} • Порода: {profile.breedDefault}</div>
        {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        {profile.ratingsPublic && agg && (<div className="mt-2 text-sm">Рейтинг: <b>{agg.ratingValue}</b> ({agg.reviewCount})</div>)}
      </header>

      <section className="rounded-xl border p-4">
        <div className="text-sm font-semibold mb-2">Портфоліо</div>
        {profile.portfolio.featuredQueenIds.length === 0 ? (
          <div className="text-sm text-[var(--secondary)]">Немає обраних маток</div>
        ) : (
          <ul className="text-sm list-disc pl-5">
            {profile.portfolio.featuredQueenIds.map(id => <li key={id}><a className="underline" href={`#/q/${id}`}>{id}</a></li>)}
          </ul>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="text-sm font-semibold mb-2">Сертифікати</div>
        {profile.certificates.length === 0 ? (<div className="text-sm text-[var(--secondary)]">Немає сертифікатів</div>) : (
          <ul className="space-y-1 text-sm">
            {profile.certificates.map(c => (
              <li key={c.id} className="flex items-center gap-2"><span>{c.title} — {c.issuer} ({new Date(c.dateISO).toLocaleDateString()})</span>{c.fileUrl && <a className="underline" href={c.fileUrl} target="_blank">Завантажити</a>}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="text-sm font-semibold mb-2">Відгуки</div>
        <ul className="space-y-2">
          {reviews.map(r => (<li key={r.id} className="rounded border p-2"><div className="text-xs text-[var(--secondary)]">{r.authorDisplay || r.authorUserId} • {new Date(r.createdAt).toLocaleDateString()} • {r.rating}★</div><div className="text-sm">{r.text}</div></li>))}
        </ul>
        {(role==='buyer' || role==='breeder') && (
          <form className="mt-3 space-y-2" onSubmit={onSubmitReview}>
            <select name="rating" className="w-full rounded border px-2 py-1 text-sm">{[5,4,3,2,1].map(n=> <option key={n} value={n}>{n} зірок</option>)}</select>
            <textarea name="text" required className="w-full rounded border px-2 py-1 text-sm" placeholder="Ваш відгук" />
            <button className="rounded-md border px-3 py-1.5 text-sm">Надіслати</button>
          </form>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="text-sm font-semibold mb-2">Питання та відповіді</div>
        <ul className="space-y-2">
          {qa.map(q => (
            <li key={q.id} className="rounded border p-2">
              <div className="text-xs text-[var(--secondary)]">{new Date(q.createdAt).toLocaleString()}</div>
              <div className="text-sm">{q.text}</div>
              {q.answer && <div className="mt-1 text-sm"><b>Відповідь:</b> {q.answer.text}</div>}
              {role==='breeder' && user?.id===profile.breederId && !q.answer && (
                <AnswerForm onSubmit={(text)=>{ answerQuestion(breederId, q.id, text, profile.breederId); setSeed(x=>x+1) }} />
              )}
            </li>
          ))}
        </ul>
        {(role==='buyer' || role==='breeder') && (
          <form className="mt-3 space-y-2" onSubmit={onAsk}>
            <input name="q" required className="w-full rounded border px-2 py-1 text-sm" placeholder="Ваше питання" />
            <button className="rounded-md border px-3 py-1.5 text-sm">Запитати</button>
          </form>
        )}
      </section>
    </div>
  )
}

function AnswerForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [v, setV] = useState('')
  return (
    <form className="mt-2 flex items-center gap-2" onSubmit={(e)=>{ e.preventDefault(); if (!v) return; onSubmit(v); setV('') }}>
      <input value={v} onChange={e=> setV(e.target.value)} className="flex-1 rounded border px-2 py-1 text-sm" placeholder="Ваша відповідь" />
      <button className="rounded-md border px-2 py-1 text-sm">Відповісти</button>
    </form>
  )
}
