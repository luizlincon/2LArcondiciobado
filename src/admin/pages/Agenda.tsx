import { useState } from 'react'
import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Ban } from 'lucide-react'
import { useDB } from '../db/store'
import { RepoError, deleteBlock, saveAppointment, setAppointmentStatus } from '../db/repo'
import type { Appointment } from '../types'
import { SERVICES, serviceTitle } from '@/lib/services'
import { Empty, FormError, FormField, Modal, PageHeader, StatusBadge, WhatsAppButton, btnDanger, btnPri, btnSm, card } from '../components/ui'

type View = 'dia' | 'semana' | 'mes'
const local = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm")

function ApptForm({ initial, onDone }: { initial?: Appointment; onDone: () => void }) {
  const db = useDB()
  const [v, setV] = useState({
    customerId: initial?.customerId ?? '', service: initial?.service ?? 'higienizacao', equipmentId: initial?.equipmentId ?? '',
    start: initial ? local(new Date(initial.start)) : '', end: initial ? local(new Date(initial.end)) : '', notes: initial?.notes ?? '',
  })
  const [err, setErr] = useState<string | null>(null)
  const eq = db.equipment.filter((e) => e.customerId === v.customerId && !e.deletedAt)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!v.start || !v.end) return setErr('Informe início e fim.')
    try { saveAppointment({ ...initial, kind: 'appointment', customerId: v.customerId, service: v.service, equipmentId: v.equipmentId || null, start: new Date(v.start).toISOString(), end: new Date(v.end).toISOString(), notes: v.notes }); onDone() }
    catch (x) { setErr(x instanceof RepoError ? x.message : 'Erro ao salvar.') }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <FormField label="Cliente"><select className="field" value={v.customerId} onChange={(e) => setV({ ...v, customerId: e.target.value, equipmentId: '' })}>
        <option value="">Selecione...</option>{db.customers.filter((c) => !c.deletedAt).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormField>
      <FormField label="Serviço"><select className="field" value={v.service} onChange={(e) => setV({ ...v, service: e.target.value })}>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></FormField>
      {eq.length > 0 && <FormField label="Equipamento (opcional)"><select className="field" value={v.equipmentId} onChange={(e) => setV({ ...v, equipmentId: e.target.value })}><option value="">Não vincular</option>{eq.map((e) => <option key={e.id} value={e.id}>{e.brand} {e.model} · {e.room}</option>)}</select></FormField>}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Início"><input type="datetime-local" className="field" value={v.start} onChange={(e) => setV({ ...v, start: e.target.value, end: v.end || e.target.value })} /></FormField>
        <FormField label="Fim"><input type="datetime-local" className="field" value={v.end} onChange={(e) => setV({ ...v, end: e.target.value })} /></FormField>
      </div>
      <FormField label="Observações"><textarea className="field" rows={2} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></FormField>
      <FormError msg={err} /><button className={btnPri}>Salvar agendamento</button>
    </form>
  )
}

function BlockForm({ onDone }: { onDone: () => void }) {
  const [v, setV] = useState({ start: '', end: '', reason: '' })
  const [err, setErr] = useState<string | null>(null)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!v.start || !v.end) return setErr('Informe início e fim.')
    try { saveAppointment({ kind: 'block', service: 'bloqueio', start: new Date(v.start).toISOString(), end: new Date(v.end).toISOString(), notes: v.reason }); onDone() }
    catch (x) { setErr(x instanceof RepoError ? x.message : 'Erro ao salvar.') }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Início"><input type="datetime-local" className="field" value={v.start} onChange={(e) => setV({ ...v, start: e.target.value })} /></FormField>
        <FormField label="Fim"><input type="datetime-local" className="field" value={v.end} onChange={(e) => setV({ ...v, end: e.target.value })} /></FormField>
      </div>
      <FormField label="Motivo"><input className="field" value={v.reason} onChange={(e) => setV({ ...v, reason: e.target.value })} placeholder="Feriado, folga..." /></FormField>
      <FormError msg={err} /><button className={btnPri}>Bloquear período</button>
    </form>
  )
}

export default function Agenda() {
  const db = useDB()
  const [view, setView] = useState<View>('semana')
  const [cursor, setCursor] = useState(new Date())
  const [modal, setModal] = useState<{ kind: 'new' | 'block' | 'edit'; item?: Appointment } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const items = db.appointments.filter((a) => !a.deletedAt && a.status !== 'cancelado')
  const on = (d: Date) => items.filter((a) => isSameDay(new Date(a.start), d)).sort((a, b) => a.start.localeCompare(b.start))
  const step = (n: number) => setCursor(view === 'dia' ? addDays(cursor, n) : view === 'semana' ? addWeeks(cursor, n) : addMonths(cursor, n))
  const title = view === 'dia' ? format(cursor, "EEEE, dd 'de' MMMM", { locale: ptBR }) : view === 'semana'
    ? `${format(startOfWeek(cursor), 'dd/MM')} a ${format(endOfWeek(cursor), 'dd/MM/yyyy')}` : format(cursor, 'MMMM yyyy', { locale: ptBR })
  const cname = (a: Appointment) => (a.kind === 'block' ? `Bloqueado${a.notes ? `: ${a.notes}` : ''}` : db.customers.find((c) => c.id === a.customerId)?.name ?? 'Cliente')

  const Row = ({ a }: { a: Appointment }) => (
    <button onClick={() => setModal({ kind: 'edit', item: a })}
      className={`block w-full rounded-lg p-2 text-left text-sm ${a.kind === 'block' ? 'bg-slate-200 text-slate-700' : a.status === 'confirmado' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-amber-50 ring-1 ring-amber-200'}`}>
      <span className="font-semibold">{format(new Date(a.start), 'HH:mm')}–{format(new Date(a.end), 'HH:mm')}</span> {cname(a)}
      {a.kind === 'appointment' && <span className="block text-xs text-muted">{serviceTitle(a.service)}</span>}
    </button>)

  const days = view === 'dia' ? [cursor] : view === 'semana' ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))
    : Array.from({ length: Math.round((+endOfWeek(endOfMonth(cursor)) - +startOfWeek(startOfMonth(cursor))) / 864e5) + 1 }, (_, i) => addDays(startOfWeek(startOfMonth(cursor)), i))
  const sel = modal?.item
  const cust = sel?.customerId ? db.customers.find((c) => c.id === sel.customerId) : undefined

  return (
    <>
      <PageHeader title="Agenda" sub="Agendamentos nunca são confirmados automaticamente"
        actions={<><button className={btnPri} onClick={() => setModal({ kind: 'new' })}><Plus className="h-4 w-4" /> Novo agendamento</button><button className={btnSm} onClick={() => setModal({ kind: 'block' })}><Ban className="h-4 w-4" /> Bloquear período</button></>} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1"><button className={btnSm} aria-label="Anterior" onClick={() => step(-1)}><ChevronLeft className="h-4 w-4" /></button>
          <button className={btnSm} onClick={() => setCursor(new Date())}>Hoje</button><button className={btnSm} aria-label="Próximo" onClick={() => step(1)}><ChevronRight className="h-4 w-4" /></button>
          <h2 className="ml-2 text-lg font-bold capitalize">{title}</h2></div>
        <div className="flex gap-1" role="group" aria-label="Visualização">{(['dia', 'semana', 'mes'] as View[]).map((x) => <button key={x} aria-pressed={view === x} onClick={() => setView(x)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize ${view === x ? 'bg-navy text-white' : 'bg-white ring-1 ring-silver'}`}>{x === 'mes' ? 'Mês' : x}</button>)}</div>
      </div>
      {view === 'dia' && (on(cursor).length === 0 ? <Empty title="Nada agendado neste dia" /> : <div className="space-y-2">{on(cursor).map((a) => <Row key={a.id} a={a} />)}</div>)}
      {view !== 'dia' && (
        <div className={`grid gap-2 ${view === 'semana' ? 'sm:grid-cols-7' : 'grid-cols-7'}`}>
          {days.map((d) => (
            <div key={+d} className={`${card} min-h-24 !p-2 ${view === 'mes' && !isSameMonth(d, cursor) ? 'opacity-40' : ''} ${isSameDay(d, new Date()) ? 'ring-2 ring-electric' : ''}`}>
              <p className="mb-1 text-xs font-bold text-navy">{view === 'semana' ? format(d, 'EEE dd', { locale: ptBR }) : format(d, 'd')}</p>
              <div className="space-y-1">{view === 'mes'
                ? (on(d).length > 0 && <button onClick={() => { setCursor(d); setView('dia') }} className="w-full rounded bg-electric/15 px-1 text-left text-xs font-semibold text-electric-600">{on(d).length} item(ns)</button>)
                : on(d).map((a) => <Row key={a.id} a={a} />)}</div>
            </div>))}
        </div>)}
      <Modal open={modal?.kind === 'new'} title="Novo agendamento" onClose={() => setModal(null)}><ApptForm onDone={() => setModal(null)} /></Modal>
      <Modal open={modal?.kind === 'block'} title="Bloquear período" onClose={() => setModal(null)}><BlockForm onDone={() => setModal(null)} /></Modal>
      <Modal open={modal?.kind === 'edit' && !!sel} title={sel?.kind === 'block' ? 'Período bloqueado' : 'Agendamento'} onClose={() => { setModal(null); setErr(null) }}>
        {sel && sel.kind === 'block' && <div className="space-y-3"><p>{format(new Date(sel.start), 'dd/MM HH:mm')} até {format(new Date(sel.end), 'dd/MM HH:mm')}. {sel.notes}</p>
          <button className={btnDanger} onClick={() => confirm('Remover este bloqueio?') && (deleteBlock(sel.id), setModal(null))}>Remover bloqueio</button></div>}
        {sel && sel.kind === 'appointment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><p className="font-semibold">{cname(sel)}</p><StatusBadge status={sel.status} /></div>
            <div className="flex flex-wrap gap-2">
              {sel.status !== 'confirmado' && <button className={btnPri} onClick={() => { setAppointmentStatus(sel.id, 'confirmado'); setModal(null) }}>Confirmar horário</button>}
              {cust && <WhatsAppButton phone={cust.phone} message={`Olá, ${cust.name.split(' ')[0]}! Sobre o atendimento de ${serviceTitle(sel.service)} em ${format(new Date(sel.start), "dd/MM 'às' HH:mm")}: `} />}
              <button className={btnDanger} onClick={() => { if (confirm('Cancelar este agendamento?')) { setAppointmentStatus(sel.id, 'cancelado'); setModal(null) } }}>Cancelar</button>
            </div>
            <FormError msg={err} />
            <hr className="border-silver" /><ApptForm key={sel.id} initial={sel} onDone={() => setModal(null)} />
          </div>)}
      </Modal>
    </>
  )
}
