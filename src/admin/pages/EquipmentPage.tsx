import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useDB } from '../db/store'
import { archiveEquipment, fmtDate, saveEquipment } from '../db/repo'
import type { Equipment } from '../types'
import { Empty, FormError, FormField, Modal, PageHeader, btnDanger, btnPri, btnSm, card } from '../components/ui'

const TYPES = ['Split', 'Janela', 'Cassete', 'Piso-teto', 'Portátil', 'Multi-split', 'Outro']

function EquipmentForm({ customerId, initial, onDone }: { customerId: string; initial?: Equipment; onDone: () => void }) {
  const [v, setV] = useState({ type: initial?.type ?? 'Split', brand: initial?.brand ?? '', model: initial?.model ?? '', btus: String(initial?.btus ?? ''), serial: initial?.serial ?? '', room: initial?.room ?? '' })
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value })
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!v.brand.trim()) return setErr('Informe a marca.')
    const btus = v.btus ? Number(v.btus) : null
    if (btus !== null && (!Number.isFinite(btus) || btus < 1000 || btus > 200000)) return setErr('BTUs inválido (ex.: 12000).')
    saveEquipment({ ...initial, customerId, type: v.type, brand: v.brand.trim(), model: v.model.trim(), btus, serial: v.serial.trim(), room: v.room.trim(), photos: initial?.photos ?? [], id: initial?.id })
    onDone()
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tipo"><select className="field" value={v.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></FormField>
        <FormField label="Capacidade (BTUs)"><input className="field" inputMode="numeric" value={v.btus} onChange={set('btus')} placeholder="12000" /></FormField>
        <FormField label="Marca"><input className="field" value={v.brand} onChange={set('brand')} /></FormField>
        <FormField label="Modelo"><input className="field" value={v.model} onChange={set('model')} /></FormField>
      </div>
      <FormField label="Ambiente no imóvel"><input className="field" value={v.room} onChange={set('room')} placeholder="Sala, quarto..." /></FormField>
      <FormField label="Número de série (opcional)"><input className="field" value={v.serial} onChange={set('serial')} /></FormField>
      <FormError msg={err} /><button className={btnPri}>Salvar equipamento</button>
    </form>
  )
}

export function EquipmentManager({ customerId }: { customerId: string }) {
  const db = useDB()
  const [form, setForm] = useState<{ open: boolean; item?: Equipment }>({ open: false })
  const list = db.equipment.filter((e) => e.customerId === customerId && !e.deletedAt)
  return (
    <>
      <div className="space-y-2">
        {list.length === 0 && <Empty title="Nenhum equipamento cadastrado" text="Cada aparelho tem seu próprio histórico e data de manutenção." />}
        {list.map((e) => {
          const vs = db.visits.filter((v) => v.equipmentId === e.id).sort((a, b) => b.date.localeCompare(a.date))
          return (
            <div key={e.id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-display font-bold text-navy">{e.brand} {e.model} · {e.btus ? `${e.btus.toLocaleString('pt-BR')} BTUs` : e.type}</p>
                  <p className="text-sm text-muted">{e.type}{e.room ? ` · ${e.room}` : ''}{e.serial ? ` · Série ${e.serial}` : ''}</p>
                  <p className="text-sm">Último atendimento: {e.lastServiceAt ? fmtDate(e.lastServiceAt) : '—'} · Próxima manutenção: <strong>{e.nextMaintenanceAt ? fmtDate(e.nextMaintenanceAt) : '—'}</strong></p></div>
                <div className="flex gap-2"><button className={btnSm} onClick={() => setForm({ open: true, item: e })}>Editar</button>
                  <button className={btnDanger} onClick={() => confirm('Arquivar este equipamento?') && archiveEquipment(e.id)}>Arquivar</button></div>
              </div>
              {vs.length > 0 && <ul className="mt-2 border-t border-silver pt-2 text-sm text-muted">{vs.map((v) => <li key={v.id}>{fmtDate(v.date)} · {v.notes || 'Atendimento registrado'}</li>)}</ul>}
            </div>)
        })}
      </div>
      <button className={`${btnSm} mt-2`} onClick={() => setForm({ open: true })}><Plus className="h-4 w-4" /> Adicionar equipamento</button>
      <Modal open={form.open} title={form.item ? 'Editar equipamento' : 'Novo equipamento'} onClose={() => setForm({ open: false })}>
        <EquipmentForm customerId={customerId} initial={form.item} onDone={() => setForm({ open: false })} /></Modal>
    </>
  )
}

export default function EquipmentPage() {
  const db = useDB()
  const list = db.equipment.filter((e) => !e.deletedAt)
  return (
    <>
      <PageHeader title="Equipamentos" sub="Cadastre aparelhos dentro da ficha de cada cliente" />
      {list.length === 0 ? <Empty title="Nenhum equipamento cadastrado" text="Abra um cliente e adicione os aparelhos dele." action={<Link className={btnSm} to="/admin/clientes">Ir para clientes</Link>} /> : (
        <ul className="space-y-2">{list.map((e) => { const c = db.customers.find((x) => x.id === e.customerId); return (
          <li key={e.id} className={`${card} flex flex-wrap justify-between gap-2`}>
            <div><p className="font-bold text-navy">{e.brand} {e.model} · {e.btus?.toLocaleString('pt-BR') ?? '—'} BTUs</p>
              <p className="text-sm text-muted">{c && <Link className="underline" to={`/admin/clientes/${c.id}`}>{c.name}</Link>}{e.room ? ` · ${e.room}` : ''}</p></div>
            <p className="text-sm">Próxima manutenção: <strong>{e.nextMaintenanceAt ? fmtDate(e.nextMaintenanceAt) : '—'}</strong></p>
          </li>) })}</ul>)}
    </>
  )
}
