import { listAll as listReviews, updateStatus } from '../reviews/store'
import { listQuestions, removeQuestion } from '../qa/store'

export default function Moderation() {
  const reviews = listReviews()
  const questions = (['breeder','queen'] as const).flatMap(ctx => listQuestions(ctx, 'B1'))
  return (
    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--surface)] shadow-sm">
      <h1 className="text-xl font-semibold">Модерація</h1>
      <div className="mt-3">
        <h2 className="text-sm font-semibold mb-2">Відгуки</h2>
        <ul className="space-y-2">
          {reviews.map(r => (
            <li key={r.id} className="rounded border p-2">
              <div className="text-sm">{r.text}</div>
              <div className="text-xs text-[var(--secondary)]">{r.status}</div>
              <div className="mt-1 flex gap-2 text-xs">
                <button className="rounded border px-2 py-1" onClick={()=>{ updateStatus(r.id,'published') }}>Publish</button>
                <button className="rounded border px-2 py-1" onClick={()=>{ updateStatus(r.id,'flagged') }}>Flag</button>
                <button className="rounded border px-2 py-1" onClick={()=>{ updateStatus(r.id,'removed') }}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Питання</h2>
        <ul className="space-y-2">
          {questions.map(q => (
            <li key={q.id} className="rounded border p-2">
              <div className="text-sm">{q.text}</div>
              <div className="mt-1 flex gap-2 text-xs">
                <button className="rounded border px-2 py-1" onClick={()=>{ removeQuestion(q.id) }}>Прибрати</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
