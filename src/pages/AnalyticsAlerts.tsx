import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import InfoTooltip from '../components/ui/InfoTooltip'
import { type AlertRule, type AlertSignal, type MetricKey, fetchMetricSeries, detectAnomalies } from '../analytics/alerts'
import { addSchedule, listSchedules, runSchedules, toggleSchedule, type Schedule } from '../analytics/scheduler'
import { listSubscriptions, upsertSubscription, removeSubscription, getUserPrefs, setUserPrefs, validateEmail, validateUrl, type Subscription, type UserPrefs } from '../analytics/subscriptions'
import { deliver } from '../analytics/transports'

const RULES_LS = 'hb.alert.rules'

export default function AnalyticsAlerts() {
  const [tab, setTab] = useState<'rules'|'signals'|'schedules'|'subs'|'prefs'>('rules')
  const [rules, setRules] = useState<AlertRule[]>(()=> { try { return JSON.parse(localStorage.getItem(RULES_LS) || '[]') as AlertRule[] } catch { return [] } })
  const [signals, setSignals] = useState<AlertSignal[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  useEffect(()=> { listSchedules().then(setSchedules) }, [])
  // subscriptions and prefs
  const [subs, setSubs] = useState<Subscription[]>(() => listSubscriptions())
  const [prefs, setPrefs] = useState<UserPrefs>(() => getUserPrefs())

  const [draft, setDraft] = useState<AlertRule>({ id: `r_${Math.random().toString(36).slice(2,8)}`, title: 'New rule', scope: 'global', metric: 'si', mode: 'zscore', z: 2.5, maWindow: 5, deltaPct: 20, minRecords: 5, halfLifeDays: 120, enabled: true })

  const saveRules = (arr: AlertRule[]) => { setRules(arr); localStorage.setItem(RULES_LS, JSON.stringify(arr)) }

  async function testRule(rule: AlertRule) {
    const series = await fetchMetricSeries({ scope: rule.scope, scopeId: rule.scopeId, metric: rule.metric })
    const sigs = detectAnomalies(series, rule)
    setSignals(sigs)
  }

  async function addNewSchedule() {
    const s: Schedule = { id: `s_${Math.random().toString(36).slice(2,8)}`, cron: '0 8 * * *', title: 'Daily Summary', enabled: true, payload: { kind: 'daily-summary', scope: 'global' } }
    await addSchedule(s); setSchedules(await listSchedules())
  }

  async function runNow() { await runSchedules(new Date()); }

  const kpi = useMemo(()=> ({
    countRules: rules.length,
    countEnabled: rules.filter(r=>r.enabled).length,
    countSignals7d: signals.length,
    countSchedules: schedules.length,
  }), [rules, signals, schedules])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <KPI label="Правил" value={kpi.countRules} />
        <KPI label="Увімкнено" value={kpi.countEnabled} />
        <KPI label="Сигнали (останнє)" value={kpi.countSignals7d} />
        <KPI label="Розклади" value={kpi.countSchedules} />
      </div>

      <div className="flex gap-2">
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='rules'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('rules')}>Правила</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='signals'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('signals')}>Сигнали</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='schedules'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('schedules')}>Розклади</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='subs'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('subs')}>Підписки</button>
        <button className={`rounded px-3 py-1.5 text-sm ${tab==='prefs'?'bg-gray-900 text-white':'border border-[var(--divider)]'}`} onClick={()=> setTab('prefs')}>Налаштування доставки</button>
        <span className="ml-auto text-xs text-[var(--secondary)] flex items-center gap-1">Як працюють алерти? <InfoTooltip text="Threshold/Z-score/Moving average delta; half-life and minimum records prevent noise." /></span>
      </div>

      {tab==='rules' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Title','Scope','Metric','Mode','Params','Enabled','Дії'].map(h=> <th key={h} className="px-3 py-2 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rules.map(r=> (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2">{r.scope}{r.scopeId?`:${r.scopeId}`:''}</td>
                    <td className="px-3 py-2">{r.metric}</td>
                    <td className="px-3 py-2">{r.mode}</td>
                    <td className="px-3 py-2 text-xs">{paramStr(r)}</td>
                    <td className="px-3 py-2"><input type="checkbox" checked={r.enabled} onChange={(e)=> saveRules(rules.map(x=> x.id===r.id? { ...x, enabled: e.target.checked }: x))} /></td>
                    <td className="px-3 py-2 flex gap-2"><Button onClick={()=> testRule(r)}>Тест</Button><Button variant="secondary" onClick={()=> saveRules(rules.filter(x=> x.id!==r.id))}>Видалити</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3">
            <div className="mb-2 text-sm font-medium">Нове правило</div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between gap-2">Title <input className="rounded-md border px-2 py-1" value={draft.title} onChange={(e)=> setDraft({ ...draft, title: e.target.value })} /></label>
              <label className="flex items-center justify-between gap-2">Scope
                <select className="rounded-md border px-2 py-1" value={draft.scope} onChange={(e)=> setDraft({ ...draft, scope: e.target.value as AlertRule['scope'] })}>
                  <option value="global">global</option>
                  <option value="region">region</option>
                  <option value="breeder">breeder</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-2">Scope ID <input className="rounded-md border px-2 py-1" value={draft.scopeId||''} onChange={(e)=> setDraft({ ...draft, scopeId: e.target.value })} /></label>
              <label className="flex items-center justify-between gap-2">Metric
                <select className="rounded-md border px-2 py-1" value={draft.metric} onChange={(e)=> setDraft({ ...draft, metric: e.target.value as MetricKey })}>
                  {(['si','bv','honey_kg','egg_day','hygienic_pct'] as MetricKey[]).map(m=> <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="flex items-center justify-between gap-2">Mode
                <select className="rounded-md border px-2 py-1" value={draft.mode} onChange={(e)=> setDraft({ ...draft, mode: e.target.value as AlertRule['mode'] })}>
                  <option value="threshold">threshold</option>
                  <option value="zscore">zscore</option>
                  <option value="ma-delta">ma-delta</option>
                </select>
              </label>
              {draft.mode==='threshold' && (<label className="flex items-center justify-between gap-2">Threshold <input type="number" className="rounded-md border px-2 py-1" value={draft.threshold||0} onChange={(e)=> setDraft({ ...draft, threshold: Number(e.target.value)||0 })} /></label>)}
              {draft.mode==='zscore' && (<label className="flex items-center justify-between gap-2">Z <input type="number" step="0.1" className="rounded-md border px-2 py-1" value={draft.z||2.5} onChange={(e)=> setDraft({ ...draft, z: Number(e.target.value)||0 })} /></label>)}
              {draft.mode==='ma-delta' && (<>
                <label className="flex items-center justify-between gap-2">MA window <input type="number" className="rounded-md border px-2 py-1" value={draft.maWindow||5} onChange={(e)=> setDraft({ ...draft, maWindow: Number(e.target.value)||0 })} /></label>
                <label className="flex items-center justify-between gap-2">Delta % <input type="number" className="rounded-md border px-2 py-1" value={draft.deltaPct||20} onChange={(e)=> setDraft({ ...draft, deltaPct: Number(e.target.value)||0 })} /></label>
              </>)}
              <div className="flex gap-2"><Button onClick={()=> saveRules([draft, ...rules])}>Додати правило</Button><Button variant="secondary" onClick={()=> testRule(draft)}>Тест правила</Button></div>
            </div>
          </div>
        </div>
      )}

      {tab==='signals' && (
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50"><tr>{['Rule','At','Scope','Metric','Value','Kind'].map(h=> <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>
              {signals.map((s,i)=> (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{s.ruleId}</td>
                  <td className="px-3 py-2">{new Date(s.at).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.scope}{s.scopeId? `:${s.scopeId}`:''}</td>
                  <td className="px-3 py-2">{s.metric}</td>
                  <td className="px-3 py-2">{String(s.value)}</td>
                  <td className="px-3 py-2">{s.kind}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='schedules' && (
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <Button onClick={addNewSchedule}>Новий розклад</Button>
            <Button variant="secondary" onClick={runNow}>Запустити зараз</Button>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50"><tr>{['Title','Cron','Enabled','Actions'].map(h=> <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>
              {schedules.map(s=> (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.title}</td>
                  <td className="px-3 py-2">{s.cron}</td>
                  <td className="px-3 py-2"><input type="checkbox" checked={!!s.enabled} onChange={async (e)=> { await toggleSchedule(s.id, e.target.checked); setSchedules(await listSchedules()) }} /></td>
                  <td className="px-3 py-2"><Button onClick={async ()=> { await runSchedules(new Date()); }}>Run</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='subs' && (
        <SubscriptionsTab rules={rules} subs={subs} onChangeSubs={setSubs} prefs={prefs} />
      )}

      {tab==='prefs' && (
        <DeliveryPrefsTab prefs={prefs} onSave={(p)=> { const next = setUserPrefs(p); setPrefs(next) }} />
      )}
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--divider)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="text-xs text-[var(--secondary)]">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function paramStr(r: AlertRule) {
  if (r.mode==='threshold') return `>=${r.threshold}`
  if (r.mode==='zscore') return `|Z|>=${r.z}`
  return `MA ${r.maWindow} Δ%>=${r.deltaPct}`
}

function SubscriptionsTab({ rules, subs, onChangeSubs, prefs }: { rules: AlertRule[]; subs: Subscription[]; onChangeSubs: (s: Subscription[])=>void; prefs: UserPrefs }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription|undefined>(undefined)
  const [form, setForm] = useState<{ id?: string; ruleId: string; channels: Array<'console'|'email'|'webhook'>; email?: string; webhookUrl?: string; digest: 'none'|'daily'|'weekly'; enabled: boolean }>(()=>({ ruleId: rules[0]?.id || '', channels: [], email: prefs.defaultEmail, webhookUrl: prefs.defaultWebhookUrl, digest:'none', enabled: true }))

  useEffect(()=>{
    if (!open) return
    if (editing) {
      setForm({ id: editing.id, ruleId: editing.ruleId, channels: [...editing.channels] as Array<'email'|'webhook'> as Array<'console'|'email'|'webhook'>, email: editing.email, webhookUrl: editing.webhookUrl, digest: editing.digest || 'none', enabled: editing.enabled })
    } else {
      setForm({ id: undefined, ruleId: rules[0]?.id || '', channels: [], email: prefs.defaultEmail, webhookUrl: prefs.defaultWebhookUrl, digest:'none', enabled: true })
    }
  }, [open, editing, rules, prefs])

  function save() {
    // persist only email/webhook channels
    const persistChannels = form.channels.filter(c=> c!=='console') as Subscription['channels']
    if (persistChannels.includes('email') && form.email && !validateEmail(form.email)) return
    if (persistChannels.includes('webhook') && form.webhookUrl && !validateUrl(form.webhookUrl)) return
    upsertSubscription({ id: form.id, ruleId: form.ruleId, channels: persistChannels, email: form.email, webhookUrl: form.webhookUrl, digest: form.digest, enabled: form.enabled })
    const next = listSubscriptions(); onChangeSubs(next); setOpen(false); setEditing(undefined)
  }

  async function sendTest() {
    const payload = { ruleId: 'test', title: 'Test', message: 'Hello from Alerts', level: 'info' as const, at: new Date().toISOString() }
    for (const ch of form.channels) {
      if (ch==='console') await deliver({ channel:'console', payload })
      if (ch==='email') await deliver({ channel:'email', target: form.email, payload })
      if (ch==='webhook') await deliver({ channel:'webhook', target: form.webhookUrl, payload })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div className="overflow-hidden rounded-xl border border-[var(--divider)] bg-[var(--surface)]">
        <div className="flex items-center justify-between p-3"><div className="text-sm font-medium">Підписки</div><Button onClick={()=> { setEditing(undefined); setOpen(true) }}>Нова підписка</Button></div>
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50"><tr>{['Rule','Channels','Digest','Targets','Enabled','Actions'].map(h=> <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
          <tbody>
            {subs.map(s=> {
              const r = rules.find(x=>x.id===s.ruleId)
              const channels = s.channels.join(',')
              const targets = [s.email, s.webhookUrl].filter(Boolean).join(', ')
              return (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{r?.title||s.ruleId}</td>
                  <td className="px-3 py-2">{channels}</td>
                  <td className="px-3 py-2">{s.digest||'none'}</td>
                  <td className="px-3 py-2">{targets||'—'}</td>
                  <td className="px-3 py-2"><input aria-label={`enabled-${s.id}`} type="checkbox" checked={!!s.enabled} onChange={(e)=> { upsertSubscription({ id: s.id, ruleId: s.ruleId, channels: s.channels, email: s.email, webhookUrl: s.webhookUrl, digest: s.digest, enabled: e.target.checked }); onChangeSubs(listSubscriptions()) }} /></td>
                  <td className="px-3 py-2 flex gap-2"><Button variant="secondary" onClick={()=> { setEditing(s); setOpen(true) }}>Edit</Button><Button onClick={()=> { removeSubscription(s.id); onChangeSubs(listSubscriptions()) }}>Delete</Button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={`rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3 ${open? '':'opacity-60'}`}>
        <div className="mb-2 text-sm font-medium">{editing? 'Редагувати підписку':'Нова підписка'}</div>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="w-28">Правило</span>
            <select aria-label="select-rule" className="flex-1 rounded border px-2 py-1" value={form.ruleId} onChange={(e)=> setForm({ ...form, ruleId: e.target.value })}>
              {rules.map(r=> <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-4">
            {(['console','email','webhook'] as const).map(c=> (
              <label key={c} className="flex items-center gap-1"><input type="checkbox" checked={form.channels.includes(c)} onChange={(e)=> setForm({ ...form, channels: e.target.checked ? [...form.channels, c] : form.channels.filter(x=>x!==c) })} /> {c}</label>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <span className="w-28">Email</span>
            <input aria-label="email" className={`flex-1 rounded border px-2 py-1 ${form.email && !validateEmail(form.email)?'border-red-400':''}`} placeholder={prefs.defaultEmail||'email@example.com'} value={form.email||''} onChange={(e)=> setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28">Webhook URL</span>
            <input aria-label="webhook" className={`flex-1 rounded border px-2 py-1 ${form.webhookUrl && !validateUrl(form.webhookUrl)?'border-red-400':''}`} placeholder={prefs.defaultWebhookUrl||'https://...'} value={form.webhookUrl||''} onChange={(e)=> setForm({ ...form, webhookUrl: e.target.value })} />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28">Digest</span>
            <select aria-label="digest" className="flex-1 rounded border px-2 py-1" value={form.digest} onChange={(e)=> setForm({ ...form, digest: e.target.value as any })}>
              <option value="none">none</option>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28">Enabled</span>
            <input type="checkbox" checked={form.enabled} onChange={(e)=> setForm({ ...form, enabled: e.target.checked })} />
          </label>
          <div className="flex gap-2">
            <Button onClick={save}>Зберегти</Button>
            <Button variant="secondary" onClick={sendTest}>Надіслати тест</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeliveryPrefsTab({ prefs, onSave }: { prefs: UserPrefs; onSave: (p: Partial<UserPrefs>)=>void }) {
  const [form, setForm] = useState<UserPrefs>(()=> ({ ...prefs }))
  useEffect(()=>{ setForm({ ...prefs }) }, [prefs])
  return (
    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface)] p-3">
      <div className="mb-2 text-sm font-medium">Налаштування доставки</div>
      <div className="space-y-2 text-sm max-w-xl">
        <label className="flex items-center gap-2"><span className="w-40">defaultEmail</span><input aria-label="defaultEmail" className="flex-1 rounded border px-2 py-1" value={form.defaultEmail||''} onChange={(e)=> setForm({ ...form, defaultEmail: e.target.value })} /></label>
        <label className="flex items-center gap-2"><span className="w-40">defaultWebhookUrl</span><input aria-label="defaultWebhookUrl" className="flex-1 rounded border px-2 py-1" value={form.defaultWebhookUrl||''} onChange={(e)=> setForm({ ...form, defaultWebhookUrl: e.target.value })} /></label>
        <label className="flex items-center gap-2"><span className="w-40">timezone</span><input aria-label="timezone" className="flex-1 rounded border px-2 py-1" value={form.timezone||''} onChange={(e)=> setForm({ ...form, timezone: e.target.value })} /></label>
        <label className="flex items-center gap-2"><span className="w-40">digestHour</span><input aria-label="digestHour" type="number" min={0} max={23} className="w-24 rounded border px-2 py-1" value={form.digestHour??''} onChange={(e)=> setForm({ ...form, digestHour: e.target.value===''? undefined : Number(e.target.value) })} /></label>
        <label className="flex items-center gap-2"><span className="w-40">digestWday</span><input aria-label="digestWday" type="number" min={0} max={6} className="w-24 rounded border px-2 py-1" value={form.digestWday??''} onChange={(e)=> setForm({ ...form, digestWday: e.target.value===''? undefined : Number(e.target.value) })} /></label>
        <div className="pt-2"><Button onClick={()=> onSave(form)}>Save</Button></div>
      </div>
    </div>
  )
}
