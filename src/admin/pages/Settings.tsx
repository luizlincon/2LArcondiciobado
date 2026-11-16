import { useState } from 'react'
import { useDB } from '../db/store'
import { saveHours } from '../db/repo'
import type { BusinessHour } from '../types'
import { FormError, PageHeader, btnPri, card } from '../components/ui'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function SettingsPage() {
  const db = useDB()
  const [h, setH] = useState<BusinessHour[]>(db.hours)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const set = (i: number, p: Partial<BusinessHour>) => setH(h.map((x, j) => (j === i ? { ...x, ...p } : x)))
  function save() {
    const bad = h.find((x) => x.enabled && x.open >= x.close)
    if (bad) return setMsg({ ok: false, t: `${DAYS[bad.weekday]}: o fechamento deve ser depois da abertura.` })
    saveHours(h); setMsg({ ok: true, t: 'Horários salvos. Novos agendamentos passam a respeitar esta grade.' })
  }
  return (
    <>
      <PageHeader title="Configurações" sub="Horário de funcionamento usado na validação da agenda" />
      <div className={`${card} space-y-2`}>
        {h.map((x, i) => (
          <div key={x.weekday} className="flex flex-wrap items-center gap-3">
            <label className="flex w-36 items-center gap-2 font-semibold"><input type="checkbox" checked={x.enabled} onChange={(e) => set(i, { enabled: e.target.checked })} /> {DAYS[x.weekday]}</label>
            <input type="time" aria-label={`Abertura ${DAYS[x.weekday]}`} className="field w-32" disabled={!x.enabled} value={x.open} onChange={(e) => set(i, { open: e.target.value })} />
            <span>às</span>
            <input type="time" aria-label={`Fechamento ${DAYS[x.weekday]}`} className="field w-32" disabled={!x.enabled} value={x.close} onChange={(e) => set(i, { close: e.target.value })} />
          </div>))}
        {msg && (msg.ok ? <p role="status" className="text-sm font-semibold text-emerald-700">{msg.t}</p> : <FormError msg={msg.t} />)}
        <button className={btnPri} onClick={save}>Salvar horários</button>
      </div>
      <p className="mt-4 text-sm text-muted">Bloqueios de períodos indisponíveis (feriados, folgas) são criados na Agenda, em “Bloquear período”.</p>
    </>
  )
}
