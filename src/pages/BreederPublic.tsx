import { useMemo, useState } from 'react'
import { getBreederPublicBySlug } from '../state/breeders.public.store'
import { listReviews, addReview, avgRating } from '../state/reviews.public.store'
import { listQuestions, addQuestion } from '../state/qa.public.store'
import { SeoHead } from '../seo/meta'

export default function BreederPublic() {
  const slug = window.location.pathname.split('/').pop() || ''
  const b = getBreederPublicBySlug(slug)
  const [seed, setSeed] = useState(0)
  const notFound = !b
  const notPublished = !!b && b.isPublished === false
  const breederId = b?.breederId || ''
  const reviews = useMemo(()=> breederId ? listReviews(breederId, { status:'approved' }) : [], [seed, breederId])
  const questions = useMemo(()=> breederId ? listQuestions(breederId, { status:'published' }) : [], [seed, breederId])
  const rating = breederId ? avgRating(breederId) : 0
  if (notFound) return <div className="p-4">Профіль не знайдено</div>
  if (notPublished) return <div className="p-4">404 — Профіль недоступний</div>
  function onAddReview(e: React.FormEvent) { e.preventDefault(); const f=e.target as HTMLFormElement; const fd=new FormData(f); addReview({ breederId:breederId, author:{ name:String(fd.get('name')||'') }, rating: Number(fd.get('rating')||5) as any, text: String(fd.get('text')||'') }); setSeed(x=>x+1); f.reset() }
  function onAddQuestion(e: React.FormEvent) { e.preventDefault(); const f=e.target as HTMLFormElement; const fd=new FormData(f); addQuestion({ breederId:breederId, author:{ name:String(fd.get('name')||'') }, text: String(fd.get('text')||'') }); setSeed(x=>x+1); f.reset() }
  return (
    <div className="p-4 space-y-4">
      <SeoHead title={`${b.displayName} — публічний профіль`} url={`https://example.com/breeder/${b.slug}`} jsonLd={{ '@context':'https://schema.org', '@type':'Person', name:b.displayName, address:b.regionCode, aggregateRating:{ '@type':'AggregateRating', ratingValue: rating.toFixed(1), reviewCount: reviews.length } }} />
      <header className="rounded-xl border bg-[var(--surface)] p-4">
        <div className="text-xl font-semibold">{b.displayName}</div>
        <div className="text-sm text-[var(--secondary)]">Регіон: {b.regionCode} • Породи: {b.breedCodes.join(', ')}</div>
        <div className="mt-1 text-sm">Рейтинг: {rating.toFixed(1)} ({reviews.length})</div>
      </header>
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h2 className="mb-2 text-sm font-semibold">Відгуки</h2>
        <ul className="space-y-2">{reviews.map(r=> (<li key={r.id} className="rounded border p-2"><div className="text-xs text-[var(--secondary)]">{r.author?.name||'Гість'} • {new Date(r.createdAt).toLocaleDateString()}</div><div className="text-xs">{r.rating}★</div><div className="text-sm">{r.text}</div></li>))}</ul>
        <form className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3" onSubmit={onAddReview}>
          <input name="name" aria-label="name" className="rounded border px-2 py-1" placeholder="Ваше імʼя" />
          <select name="rating" aria-label="rating" className="rounded border px-2 py-1">{[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}★</option>)}</select>
          <input name="text" aria-label="text" className="rounded border px-2 py-1 md:col-span-2" placeholder="Відгук" />
          <button className="rounded border px-3 py-1.5">Надіслати</button>
        </form>
      </section>
      <section className="rounded-xl border bg-[var(--surface)] p-4">
        <h2 className="mb-2 text-sm font-semibold">Q&A</h2>
        <ul className="space-y-2">{questions.map(q=> (<li key={q.id} className="rounded border p-2"><div className="text-xs text-[var(--secondary)]">{q.author?.name||'Гість'} • {new Date(q.createdAt).toLocaleDateString()}</div><div className="text-sm">{q.text}</div>{q.answer && <div className="mt-1 text-xs">Відповідь: {q.answer.text}</div>}</li>))}</ul>
        <form className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3" onSubmit={onAddQuestion}>
          <input name="name" aria-label="name" className="rounded border px-2 py-1" placeholder="Ваше імʼя" />
          <input name="text" aria-label="text" className="rounded border px-2 py-1 md:col-span-2" placeholder="Питання" />
          <button className="rounded border px-3 py-1.5">Запитати</button>
        </form>
      </section>
    </div>
  )
}
