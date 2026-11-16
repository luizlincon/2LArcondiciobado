import { useState } from 'react'
import { useDB } from '../db/store'
import { RepoError, convertRequestToAppointment, fmtDate, updateRequest } from '../db/repo'
import { STATUS_LABEL, STATUS_ORDER, type QuoteRequest, type Status } from '../types'
import { SERVICES, serviceTitle } from '@/lib/services'
import { PERIODS } from '@/lib/quoteSchema'
import { Empty, FormError, FormField, Modal, PageHeader, StatusBadge, WhatsAppButton, brl, btnPri, btnSm, card, fmtPhone } from '../components/ui'

function Detail({ req, onClose }: { req: QuoteRequest; onClose: () => void }) {
  const db = useDB()
  const c = db.customers.find((x) => x.id === req.customerId)
  const [v, setV] = useState({ service: req.service, quantity: String(req.quantity), location: req.location, notes: req.notes, value: req.quoteValue?.toString() ?? '', status: req.status })
  const [when, setWhen] = useState(req.preferredDate ? `${req.preferredDate}T09:00` : '')
  const [err, setErr] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const quoteMsg = `Olá${c ? `, ${c.name.split(' ')[0]}` : ''}! Aqui é da 2L Ar Condicionado. Analisamos sua solicitação de ${serviceTitle(v.service)}${v.value ? ` e o orçamento ficou em ${brl(Number(v.value.replace(',', '.')))}` : ''}.`
  function save() {
    const qty = Number(v.quantity), val = v.value.trim() === '' ? null : Number(v.value.replace(',', '.'))
    if (!Number.isInteger(qty) || qty < 1) return setErr('Quantidade inválida.')
    if (val !== null && (!Number.isFinite(val) || val < 0)) return setErr('Valor do orçamento inválido.')
    updateRequest(req.id, { service: v.service, quantity: qty, location: v.location, notes: v.notes, quoteValue: val, status: v.status as Status })
    setErr(null); setSaved(true)
  }
  function convert() {
    if (!when) return setErr('Escolha data e hora para o agendamento.')
    try { convertRequestToAppointment({ ...req, service: v.service, notes: v.notes }, new Date(when).toISOString()); onClose() }
    catch (x) { setErr(x instanceof RepoError ? x.message : 'Erro ao agendar.') }
  }
  const period = PERIODS.find((p) => p.id === req.preferredPeriod)?.label
  return (
    <div className="space-y-4">
      {c && <p className="text-sm"><strong>{c.name}</strong> · {fmtPhone(c.phone)} · recebido em {fmtDate(req.createdAt)}</p>}
      <p className="text-sm text-muted">Preferência do cliente: {req.preferredDate ? fmtDate(req.preferredDate) : 'sem data'}{period ? ` · ${period}` : ''}. Não é uma confirmação.</p>
      {req.photos.filter(Boolean).length > 0 && (
        <div className="grid grid-cols-3 gap-2">{req.photos.filter(Boolean).map((p, i) => <a key={i} href={p} target="_blank" rel="noopener noreferrer"><img src={p} alt={`Foto ${i + 1} do equipamento`} className="aspect-square w-full rounded-lg object-cover" /></a>)}</div>)}
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <FormField label="Serviço"><select className="field" value={v.service} onChange={(e) => setV({ ...v, service: e.target.value })}>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></FormField>
        <FormField label="Aparelhos"><input className="field" inputMode="numeric" value={v.quantity} onChange={(e) => setV({ ...v, quantity: e.target.value })} /></FormField>
      </div>
      <FormField label="Localização"><input className="field" value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} /></FormField>
      <FormField label="Observações"><textarea className="field" rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Valor do orçamento (R$)"><input className="field" inputMode="decimal" value={v.value} onChange={(e) => setV({ ...v, value: e.target.value })} placeholder="0,00" /></FormField>
        <FormField label="Status"><select className="field" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as Status })}>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></FormField>
      </div>
      <FormError msg={err} />
      {saved && <p role="status" className="text-sm font-semibold text-emerald-700">Alterações salvas.</p>}
      <div className="flex flex-wrap gap-2"><button className={btnPri} onClick={save}>Salvar alterações</button>{c && <WhatsAppButton phone={c.phone} message={quoteMsg} label="Abrir WhatsApp" />}</div>
      {!req.appointmentId && (
        <div className="rounded-lg bg-mist p-3"><p className="mb-2 text-sm font-semibold text-navy">Converter em agendamento (fica aguardando confirmação)</p>
          <div className="flex flex-wrap gap-2"><input type="datetime-local" className="field max-w-60" value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Data e hora do agendamento" /><button className={btnSm} onClick={convert}>Agendar</button></div></div>)}
      {req.appointmentId && <p className="text-sm text-muted">Esta solicitação já foi convertida em agendamento (veja a Agenda).</p>}
    </div>
  )
}

export default function Requests() {
  const db = useDB()
  const [filter, setFilter] = useState<Status | 'todos'>('todos')
  const [openId, setOpenId] = useState<string | null>(null)
  const list = db.requests.filter((r) => filter === 'todos' || r.status === filter)
  const open = db.requests.find((r) => r.id === openId)
  return (
    <>
      <PageHeader title="Solicitações" sub="Oportunidades recebidas pelo site" />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
        {(['todos', ...STATUS_ORDER] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${filter === s ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-silver'}`}>{s === 'todos' ? 'Todas' : STATUS_LABEL[s]}</button>))}
      </div>
      {list.length === 0 ? <Empty title="Nenhuma solicitação" text="Quando alguém enviar o formulário do site, o pedido aparece aqui." /> : (
        <ul className="space-y-2">{list.map((r) => { const c = db.customers.find((x) => x.id === r.customerId); return (
          <li key={r.id}><button onClick={() => setOpenId(r.id)} className={`${card} w-full text-left hover:border-electric`}>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-display text-lg font-bold text-navy">{c?.name ?? 'Cliente'}</span><StatusBadge status={r.status} /></div>
            <p className="text-sm text-muted">{serviceTitle(r.service)} · {r.quantity} aparelho(s) · {r.location}</p>
            <p className="text-xs text-muted">{c && fmtPhone(c.phone)} · {fmtDate(r.createdAt)} · {r.photos.filter(Boolean).length} foto(s){r.quoteValue != null ? ` · Orçamento ${brl(r.quoteValue)}` : ''}</p>
          </button></li>) })}</ul>)}
      <Modal open={!!open} title="Solicitação" onClose={() => setOpenId(null)} wide>{open && <Detail key={open.id} req={open} onClose={() => setOpenId(null)} />}</Modal>
    </>
  )
}
