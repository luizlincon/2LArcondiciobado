import { useDB } from '../db/store'
import { dueState } from '../lib/maintenance'
import { fmtDate, setReminderStatus } from '../db/repo'
import { serviceTitle } from '@/lib/services'
import { Empty, PageHeader, WhatsAppButton, btnSm, card, fmtPhone } from '../components/ui'

export default function Maintenance() {
  const db = useDB()
  const rows = db.reminders.filter((r) => r.status !== 'concluido').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((r) => ({
    r, state: dueState(r.dueDate), c: db.customers.find((x) => x.id === r.customerId), e: db.equipment.find((x) => x.id === r.equipmentId),
    v: db.visits.find((x) => x.id === r.visitId),
  }))
  const groups = [{ k: 'vencida', t: 'Vencidas' }, { k: 'proxima', t: 'Próximas (30 dias)' }, { k: 'futura', t: 'Futuras' }] as const
  return (
    <>
      <PageHeader title="Manutenções" sub="Clientes a contatar. O sistema calcula; o envio é manual pelo WhatsApp." />
      {rows.length === 0 ? <Empty title="Nenhuma manutenção prevista" text="Ao concluir um atendimento com intervalo ou data recomendada, o lembrete aparece aqui." /> :
        groups.map((g) => { const items = rows.filter((x) => x.state === g.k); if (!items.length) return null; return (
          <section key={g.k} className="mb-6"><h2 className={`mb-2 text-lg font-bold ${g.k === 'vencida' ? 'text-red-700' : ''}`}>{g.t} ({items.length})</h2>
            <ul className="space-y-2">{items.map(({ r, c, e, v }) => (
              <li key={r.id} className={`${card} flex flex-wrap items-center justify-between gap-3 ${g.k === 'vencida' ? 'border-red-300' : ''}`}>
                <div><p className="font-display font-bold text-navy">{c?.name}</p>
                  <p className="text-sm text-muted">{c && fmtPhone(c.phone)} · {e ? `${e.brand} ${e.model} (${e.room || e.type})` : 'Equipamento não vinculado'}</p>
                  <p className="text-sm">Prevista: <strong>{fmtDate(r.dueDate)}</strong>{v ? ` · último: ${serviceTitle(v.service)} em ${fmtDate(v.date)}` : ''}{r.status === 'contatado' ? ' · já contatado' : ''}</p></div>
                <div className="flex gap-2">
                  {c && <WhatsAppButton phone={c.phone} label="Contatar" message={`Olá, ${c.name.split(' ')[0]}! Aqui é da 2L Ar Condicionado. Está chegando a hora da manutenção do seu ar-condicionado${e ? ` (${e.room || e.brand})` : ''}, prevista para ${fmtDate(r.dueDate)}. Quer agendar um horário?`} />}
                  {r.status === 'pendente' && <button className={btnSm} onClick={() => setReminderStatus(r.id, 'contatado')}>Marcar contatado</button>}
                </div></li>))}</ul></section>) })}
    </>
  )
}
