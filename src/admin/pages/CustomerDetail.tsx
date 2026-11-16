import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDB } from '../db/store'
import { archiveCustomer, fmtDate } from '../db/repo'
import { serviceTitle } from '@/lib/services'
import { Empty, Modal, PageHeader, WhatsAppButton, btnDanger, btnSm, card, fmtPhone } from '../components/ui'
import { CustomerForm } from './Customers'
import { EquipmentManager } from './EquipmentPage'

export default function CustomerDetail() {
  const { id } = useParams()
  const db = useDB()
  const nav = useNavigate()
  const [edit, setEdit] = useState(false)
  const c = db.customers.find((x) => x.id === id && !x.deletedAt)
  if (!c) return <Empty title="Cliente não encontrado" action={<Link className={btnSm} to="/admin/clientes">Voltar</Link>} />
  const visits = db.visits.filter((v) => v.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date))
  const reqs = db.requests.filter((r) => r.customerId === c.id)
  const eqName = (eid?: string | null) => { const e = db.equipment.find((x) => x.id === eid); return e ? `${e.brand} ${e.model} (${e.room || e.type})` : 'Sem equipamento vinculado' }
  return (
    <>
      <PageHeader title={c.name} sub={`${fmtPhone(c.phone)} · ${[c.address, c.neighborhood, c.city].filter(Boolean).join(', ')}`}
        actions={<><WhatsAppButton phone={c.phone} message={`Olá, ${c.name.split(' ')[0]}! Aqui é da 2L Ar Condicionado.`} />
          <button className={btnSm} onClick={() => setEdit(true)}>Editar</button>
          <button className={btnDanger} onClick={() => { if (confirm('Arquivar este cliente? O histórico é preservado.')) { archiveCustomer(c.id); nav('/admin/clientes') } }}>Arquivar</button></>} />
      {c.notes && <p className={`${card} mb-4 text-sm`}>{c.notes}</p>}
      <section className="mb-6"><h2 className="mb-2 text-lg font-bold">Equipamentos</h2><EquipmentManager customerId={c.id} /></section>
      <section className="mb-6"><h2 className="mb-2 text-lg font-bold">Histórico de atendimentos</h2>
        {visits.length === 0 ? <Empty title="Nenhum atendimento registrado" /> : (
          <ol className="space-y-2">{visits.map((v) => (
            <li key={v.id} className={card}>
              <p className="font-semibold">{fmtDate(v.date)} · {serviceTitle(v.service)}</p>
              <p className="text-sm text-muted">{eqName(v.equipmentId)} · {v.address}</p>
              {v.notes && <p className="mt-1 text-sm">{v.notes}</p>}
              {v.nextMaintenanceAt && <p className="mt-1 text-sm font-semibold text-electric-600">Próxima manutenção: {fmtDate(v.nextMaintenanceAt)}</p>}
            </li>))}</ol>)}
      </section>
      <section><h2 className="mb-2 text-lg font-bold">Solicitações</h2>
        {reqs.length === 0 ? <Empty title="Nenhuma solicitação" /> : <ul className="space-y-2">{reqs.map((r) => <li key={r.id} className={`${card} text-sm`}>{fmtDate(r.createdAt)} · {serviceTitle(r.service)} · {r.status}</li>)}</ul>}
      </section>
      <Modal open={edit} title="Editar cliente" onClose={() => setEdit(false)}><CustomerForm initial={c} onDone={() => setEdit(false)} /></Modal>
    </>
  )
}
