import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDB } from '../db/store'
import { fmtDate } from '../db/repo'
import { SERVICES, serviceTitle } from '@/lib/services'
import { PinsMap, type MapPoint } from '../components/MapView'
import { Empty, FormField, PageHeader, card } from '../components/ui'

export default function VisitMap() {
  const db = useDB()
  const [f, setF] = useState({ from: '', to: '', service: '' })
  const visits = useMemo(() => db.visits.filter((v) => (!f.from || v.date >= f.from) && (!f.to || v.date <= f.to) && (!f.service || v.service === f.service)), [db.visits, f])
  const points: MapPoint[] = useMemo(() => visits.map((v) => ({
    id: v.id, lat: v.lat, lng: v.lng,
    lines: [db.customers.find((c) => c.id === v.customerId)?.name ?? 'Cliente', fmtDate(v.date), serviceTitle(v.service), v.address],
  })), [visits, db.customers])
  return (
    <>
      <PageHeader title="Mapa de atendimentos" sub="Um pino por visita realizada. Visível apenas para o administrador." />
      <div className={`${card} mb-4 grid gap-3 sm:grid-cols-3`}>
        <FormField label="De"><input type="date" className="field" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></FormField>
        <FormField label="Até"><input type="date" className="field" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></FormField>
        <FormField label="Serviço"><select className="field" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}><option value="">Todos</option>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></FormField>
      </div>
      {db.visits.length === 0 ? <Empty title="Nenhuma visita no mapa" text="Cada atendimento concluído com pino posicionado aparece aqui." /> : (
        <>
          <p className="mb-2 text-sm text-muted">{visits.length} visita(s) exibida(s)</p>
          <PinsMap points={points} />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">{visits.map((v) => <li key={v.id} className={`${card} text-sm`}><strong>{fmtDate(v.date)}</strong> · {serviceTitle(v.service)}<br />
            <Link className="underline" to={`/admin/clientes/${v.customerId}`}>{db.customers.find((c) => c.id === v.customerId)?.name}</Link> · {v.address}</li>)}</ul>
        </>)}
    </>
  )
}
