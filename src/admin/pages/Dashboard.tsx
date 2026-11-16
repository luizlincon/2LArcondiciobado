import { Link } from 'react-router-dom'
import { useDB } from '../db/store'
import { dueState } from '../lib/maintenance'
import { STATUS_LABEL, STATUS_ORDER } from '../types'
import { Empty, PageHeader, card } from '../components/ui'

export default function Dashboard() {
  const db = useDB()
  const customers = db.customers.filter((c) => !c.deletedAt)
  const open = db.reminders.filter((r) => r.status !== 'concluido')
  const kpis = [
    { label: 'Novas solicitações', value: db.requests.filter((r) => r.status === 'novo').length, to: '/admin/solicitacoes' },
    { label: 'Orçamentos pendentes', value: db.requests.filter((r) => r.status === 'em_analise').length, to: '/admin/solicitacoes' },
    { label: 'Agendamentos confirmados', value: db.appointments.filter((a) => a.kind === 'appointment' && a.status === 'confirmado').length, to: '/admin/agenda' },
    { label: 'Atendimentos concluídos', value: db.visits.length, to: '/admin/atendimentos' },
    { label: 'Total de clientes', value: customers.length, to: '/admin/clientes' },
    { label: 'Próximas manutenções', value: open.filter((r) => dueState(r.dueDate) === 'proxima').length, to: '/admin/manutencoes' },
    { label: 'Manutenções vencidas', value: open.filter((r) => dueState(r.dueDate) === 'vencida').length, to: '/admin/manutencoes', alert: true },
  ]
  const byStatus = STATUS_ORDER.map((s) => ({ s, n: db.requests.filter((r) => r.status === s).length }))
  const max = Math.max(1, ...byStatus.map((x) => x.n))
  const hasData = db.requests.length + db.visits.length + customers.length > 0
  return (
    <>
      <PageHeader title="Dashboard" sub="Visão geral da operação da 2L" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className={`${card} hover:border-electric ${k.alert && k.value > 0 ? 'border-red-300 bg-red-50' : ''}`}>
            <p className="text-3xl font-extrabold text-navy">{k.value}</p>
            <p className="text-sm text-muted">{k.label}</p>
          </Link>
        ))}
      </div>
      <section className={`${card} mt-6`}>
        <h2 className="mb-3 text-lg font-bold">Solicitações por status</h2>
        {db.requests.length === 0 ? (
          <Empty title="Sem solicitações ainda" text="O gráfico aparece quando houver pedidos reais." />
        ) : (
          <ul className="space-y-2" aria-label="Solicitações por status">
            {byStatus.map(({ s, n }) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-muted">{STATUS_LABEL[s]}</span>
                <div className="h-5 flex-1 rounded bg-mist"><div className="h-5 rounded bg-electric" style={{ width: `${(n / max) * 100}%` }} /></div>
                <span className="w-6 text-right font-semibold">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {!hasData && <div className="mt-6"><Empty title="Nenhum dado cadastrado" text="Os indicadores são calculados somente com dados reais. Quando chegarem solicitações pelo site, elas aparecem aqui." /></div>}
    </>
  )
}
