import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crosshair, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useDB } from '../db/store'
import { RepoError, completeVisit, fmtDate } from '../db/repo'
import { SERVICES, serviceTitle } from '@/lib/services'
import { computeNextMaintenance } from '../lib/maintenance'
import { fileToDataUrl } from '@/lib/image'
import { MapPicker } from '../components/MapView'
import { Empty, FormError, FormField, Modal, PageHeader, btnPri, btnSm, card } from '../components/ui'

function VisitForm({ onDone }: { onDone: () => void }) {
  const db = useDB()
  const [v, setV] = useState({ appointmentId: '', customerId: '', equipmentId: '', service: 'higienizacao', date: format(new Date(), 'yyyy-MM-dd'), notes: '', address: '', mode: 'months' as 'months' | 'date', months: '6', specific: '' })
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [err, setErr] = useState<string | null>(null)
  const open = db.appointments.filter((a) => a.kind === 'appointment' && (a.status === 'confirmado' || a.status === 'aguardando_confirmacao') && a.customerId)
  const eq = db.equipment.filter((e) => e.customerId === v.customerId && !e.deletedAt)
  const next = computeNextMaintenance(v.date, v.mode === 'months' ? { intervalMonths: Number(v.months) } : { specificDate: v.specific })

  function fromAppointment(id: string) {
    const a = db.appointments.find((x) => x.id === id)
    if (!a) return setV({ ...v, appointmentId: '' })
    const c = db.customers.find((x) => x.id === a.customerId)
    setV({ ...v, appointmentId: id, customerId: a.customerId ?? '', service: a.service, equipmentId: a.equipmentId ?? '', date: [format(new Date(a.start), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')].sort()[0], address: c ? [c.address, c.neighborhood].filter(Boolean).join(', ') : v.address })
  }
  function pickCustomer(id: string) {
    const c = db.customers.find((x) => x.id === id)
    setV({ ...v, customerId: id, equipmentId: '', address: c ? [c.address, c.neighborhood].filter(Boolean).join(', ') : '' })
  }
  function geolocate() {
    navigator.geolocation?.getCurrentPosition((p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }), () => setErr('Não foi possível obter sua localização. Clique no mapa para posicionar o pino.'))
  }
  async function addPhotos(files: FileList | null) {
    if (!files) return
    const urls = (await Promise.all(Array.from(files).slice(0, 6).map((f) => fileToDataUrl(f)))).filter(Boolean)
    setPhotos((p) => [...p, ...urls].slice(0, 6))
  }
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!v.customerId) return setErr('Selecione o cliente.')
    if (!v.date || v.date > format(new Date(), 'yyyy-MM-dd')) return setErr('A data do atendimento não pode estar no futuro.')
    if (!v.address.trim()) return setErr('Informe o endereço da visita.')
    if (!pos) return setErr('Posicione o pino da visita no mapa (clique no mapa, arraste ou use sua localização).')
    if (v.mode === 'months' && !(Number(v.months) > 0)) return setErr('Informe o intervalo em meses ou escolha uma data específica.')
    if (v.mode === 'date' && !v.specific) return setErr('Informe a data da próxima manutenção.')
    try { completeVisit({ customerId: v.customerId, equipmentId: v.equipmentId || null, appointmentId: v.appointmentId || null, service: v.service, date: v.date, notes: v.notes, photos, address: v.address, lat: pos.lat, lng: pos.lng, intervalMonths: v.mode === 'months' ? Number(v.months) : null, specificDate: v.mode === 'date' ? v.specific : null }); onDone() }
    catch (x) { setErr(x instanceof RepoError ? x.message : 'Erro ao salvar.') }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      {open.length > 0 && <FormField label="Preencher a partir de um agendamento (opcional)"><select className="field" value={v.appointmentId} onChange={(e) => fromAppointment(e.target.value)}>
        <option value="">Atendimento avulso</option>{open.map((a) => <option key={a.id} value={a.id}>{format(new Date(a.start), 'dd/MM HH:mm')} · {db.customers.find((c) => c.id === a.customerId)?.name}</option>)}</select></FormField>}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Cliente"><select className="field" value={v.customerId} onChange={(e) => pickCustomer(e.target.value)}><option value="">Selecione...</option>{db.customers.filter((c) => !c.deletedAt).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormField>
        <FormField label="Equipamento"><select className="field" value={v.equipmentId} onChange={(e) => setV({ ...v, equipmentId: e.target.value })} disabled={!v.customerId}><option value="">Sem vínculo</option>{eq.map((e) => <option key={e.id} value={e.id}>{e.brand} {e.model} · {e.room}</option>)}</select></FormField>
        <FormField label="Serviço realizado"><select className="field" value={v.service} onChange={(e) => setV({ ...v, service: e.target.value })}>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></FormField>
        <FormField label="Data do atendimento"><input type="date" className="field" max={format(new Date(), 'yyyy-MM-dd')} value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></FormField>
      </div>
      <FormField label="Observações técnicas"><textarea className="field" rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></FormField>
      <FormField label="Fotos do atendimento"><input type="file" accept="image/*" multiple onChange={(e) => addPhotos(e.target.files)} />
        {photos.length > 0 && <div className="mt-2 flex gap-2">{photos.map((p, i) => <img key={i} src={p} alt={`Foto ${i + 1}`} className="h-16 w-16 rounded object-cover" />)}</div>}</FormField>
      <FormField label="Endereço da visita"><input className="field" value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} /></FormField>
      <div><div className="mb-1 flex items-center justify-between"><span className="text-sm font-semibold text-navy">Pino no mapa {pos ? `(${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)})` : '(obrigatório)'}</span>
        <button type="button" className={btnSm} onClick={geolocate}><Crosshair className="h-4 w-4" /> Usar minha localização</button></div>
        <MapPicker value={pos} onChange={setPos} /><p className="mt-1 text-xs text-muted">Clique no mapa para posicionar e arraste o pino para ajustar. Nenhuma coordenada é inventada.</p></div>
      <fieldset className="rounded-lg bg-mist p-3"><legend className="px-1 text-sm font-semibold text-navy">Próxima manutenção recomendada</legend>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm"><input type="radio" checked={v.mode === 'months'} onChange={() => setV({ ...v, mode: 'months' })} /> Intervalo em meses</label>
          <input className="field w-20" inputMode="numeric" disabled={v.mode !== 'months'} value={v.months} onChange={(e) => setV({ ...v, months: e.target.value })} aria-label="Meses" />
          <label className="flex items-center gap-1.5 text-sm"><input type="radio" checked={v.mode === 'date'} onChange={() => setV({ ...v, mode: 'date' })} /> Data específica</label>
          <input type="date" className="field w-44" disabled={v.mode !== 'date'} value={v.specific} onChange={(e) => setV({ ...v, specific: e.target.value })} aria-label="Data específica" /></div>
        <p className="mt-2 text-sm">Será registrada para: <strong>{next ? fmtDate(next) : '—'}</strong></p></fieldset>
      <FormError msg={err} /><button className={btnPri}>Concluir e registrar atendimento</button>
    </form>
  )
}

export default function Visits() {
  const db = useDB()
  const [open, setOpen] = useState(false)
  const list = [...db.visits].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <>
      <PageHeader title="Atendimentos" sub="Serviços efetivamente realizados" actions={<button className={btnPri} onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Registrar atendimento</button>} />
      {list.length === 0 ? <Empty title="Nenhum atendimento registrado" text="Ao concluir um atendimento: a visita entra no histórico, vira um pino no mapa e a próxima manutenção é calculada." /> : (
        <ul className="space-y-2">{list.map((v) => { const c = db.customers.find((x) => x.id === v.customerId); const e = db.equipment.find((x) => x.id === v.equipmentId); return (
          <li key={v.id} className={card}>
            <p className="font-display font-bold text-navy">{fmtDate(v.date)} · {serviceTitle(v.service)}</p>
            <p className="text-sm">{c && <Link className="underline" to={`/admin/clientes/${c.id}`}>{c.name}</Link>}{e ? ` · ${e.brand} ${e.model} (${e.room})` : ''}</p>
            <p className="text-sm text-muted">{v.address}</p>
            {v.notes && <p className="mt-1 text-sm">{v.notes}</p>}
            {v.nextMaintenanceAt && <p className="mt-1 text-sm font-semibold text-electric-600">Próxima manutenção: {fmtDate(v.nextMaintenanceAt)}</p>}
          </li>) })}</ul>)}
      <Modal open={open} title="Registrar atendimento" onClose={() => setOpen(false)} wide>{open && <VisitForm onDone={() => setOpen(false)} />}</Modal>
    </>
  )
}
