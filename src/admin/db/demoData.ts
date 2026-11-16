import { addDays, addMonths, format, setHours, setMinutes, startOfDay } from 'date-fns'
import type { DB } from '../types'
import { computeNextMaintenance } from '../lib/maintenance'
import { defaultHours, setDB, uid, now } from './store'

/** Dados fictícios de DEMONSTRAÇÃO. Nomes e coordenadas aproximadas apenas ilustrativos; vivem só no navegador. */
export function loadDemoData() {
  const t = now(), today = startOfDay(new Date())
  const c = (name: string, phone: string, neighborhood: string, address: string) =>
    ({ id: uid(), name: `${name} (demo)`, phone, address, neighborhood, city: 'Brasília', notes: '', createdAt: t, updatedAt: t })
  const customers = [
    c('Ana Souza', '61990000001', 'Asa Norte', 'SQN 305 Bloco A'),
    c('Carlos Lima', '61990000002', 'Lago Sul', 'SHIS QL 10'),
    c('Marina Costa', '61990000003', 'Águas Claras', 'Rua 12 Norte'),
  ]
  const eq = (ci: number, room: string, brand: string, btus: number, last: string | null, next: string | null) =>
    ({ id: uid(), customerId: customers[ci].id, type: 'Split', brand, model: 'Inverter', btus, serial: '', room, photos: [], lastServiceAt: last, nextMaintenanceAt: next, createdAt: t, updatedAt: t })
  const d = (n: number) => format(addDays(today, n), 'yyyy-MM-dd')
  const equipment = [
    eq(0, 'Sala', 'Samsung', 12000, d(-200), d(-20)),
    eq(0, 'Quarto', 'LG', 9000, d(-100), d(80)),
    eq(1, 'Escritório', 'Midea', 18000, d(-170), d(10)),
    eq(2, 'Sala', 'Elgin', 12000, null, null),
  ]
  const visit = (ci: number, ei: number | null, ago: number, service: string, lat: number, lng: number, months: number | null) => {
    const date = d(-ago)
    return { id: uid(), customerId: customers[ci].id, equipmentId: ei === null ? null : equipment[ei].id, service, date, notes: 'Atendimento de demonstração.', photos: [],
      address: `${customers[ci].address}, ${customers[ci].neighborhood}`, lat, lng, intervalMonths: months,
      nextMaintenanceAt: months ? computeNextMaintenance(date, { intervalMonths: months }) : null, createdAt: t, updatedAt: t }
  }
  const visits = [
    visit(0, 0, 200, 'higienizacao', -15.7635, -47.8719, 6), visit(0, 1, 100, 'higienizacao', -15.7635, -47.8719, 6),
    visit(1, 2, 170, 'manutencao_preventiva', -15.8346, -47.8626, 6), visit(2, null, 30, 'instalacao', -15.8350, -48.0270, null),
  ]
  const reminders = visits.filter((v) => v.nextMaintenanceAt).map((v) => ({ id: uid(), customerId: v.customerId, equipmentId: v.equipmentId, visitId: v.id, dueDate: v.nextMaintenanceAt!, status: 'pendente' as const, createdAt: t, updatedAt: t }))
  const at = (n: number, h: number) => setMinutes(setHours(addDays(today, n), h), 0).toISOString()
  const requests = [
    { id: uid(), customerId: customers[2].id, service: 'higienizacao', quantity: 2, location: 'Águas Claras, Rua 12 Norte', notes: 'Pedido de demonstração.', preferredDate: d(3), preferredPeriod: 'manha', status: 'novo' as const, quoteValue: null, photos: [], createdAt: t, updatedAt: t },
    { id: uid(), customerId: customers[1].id, service: 'carga_gas', quantity: 1, location: 'Lago Sul, SHIS QL 10', notes: 'Pedido de demonstração.', preferredDate: '', preferredPeriod: 'indiferente', status: 'em_analise' as const, quoteValue: 350, photos: [], createdAt: t, updatedAt: t },
  ]
  const appointments = [
    { id: uid(), kind: 'appointment' as const, customerId: customers[0].id, service: 'higienizacao', start: at(1, 9), end: at(1, 11), status: 'confirmado' as const, notes: 'Demo', createdAt: t, updatedAt: t },
    { id: uid(), kind: 'appointment' as const, customerId: customers[1].id, service: 'manutencao_preventiva', start: at(2, 14), end: at(2, 16), status: 'aguardando_confirmacao' as const, notes: 'Demo', createdAt: t, updatedAt: t },
  ]
  const db: DB = { customers, equipment, requests, appointments, visits, reminders, hours: defaultHours() }
  void addMonths
  setDB(db)
}
