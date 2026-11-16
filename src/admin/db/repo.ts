import { addMinutes, format } from 'date-fns'
import type { Appointment, Customer, Equipment, QuoteRequest, Reminder, Status, Visit } from '../types'
import { computeNextMaintenance } from '../lib/maintenance'
import { checkAvailability } from '../lib/schedule'
import { getDB, now, uid, update } from './store'

/**
 * Camada de dados. Hoje persiste no navegador (modo demonstração).
 * Na ligação com o Supabase, cada função vira uma chamada ao banco mantendo a mesma assinatura;
 * as validações (conflito de agenda, duplicidade de cliente) passam a viver também no servidor.
 */
export class RepoError extends Error {}

export function findCustomerByPhone(phone: string) {
  return getDB().customers.find((c) => c.phone === phone && !c.deletedAt)
}

export function saveCustomer(input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
  const dup = getDB().customers.find((c) => c.phone === input.phone && c.id !== input.id && !c.deletedAt)
  if (dup) throw new RepoError(`Já existe um cliente com este WhatsApp: ${dup.name}.`)
  const t = now()
  let saved!: Customer
  update((db) => {
    const existing = input.id ? db.customers.find((c) => c.id === input.id) : undefined
    saved = { ...(existing ?? { id: uid(), createdAt: t }), ...input, id: existing?.id ?? uid(), updatedAt: t } as Customer
    if (existing) saved.id = existing.id
    return { ...db, customers: existing ? db.customers.map((c) => (c.id === existing.id ? saved : c)) : [saved, ...db.customers] }
  })
  return saved
}

export function archiveCustomer(id: string) {
  update((db) => ({ ...db, customers: db.customers.map((c) => (c.id === id ? { ...c, deletedAt: now() } : c)) }))
}

export function saveEquipment(input: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const t = now()
  update((db) => {
    const ex = input.id ? db.equipment.find((e) => e.id === input.id) : undefined
    const saved = { ...(ex ?? { createdAt: t }), ...input, id: ex?.id ?? uid(), updatedAt: t } as Equipment
    return { ...db, equipment: ex ? db.equipment.map((e) => (e.id === ex.id ? saved : e)) : [saved, ...db.equipment] }
  })
}
export function archiveEquipment(id: string) {
  update((db) => ({ ...db, equipment: db.equipment.map((e) => (e.id === id ? { ...e, deletedAt: now() } : e)) }))
}

/** Entrada pública: cria/reaproveita cliente pelo telefone e registra a solicitação como "novo". */
export function createPublicQuote(p: {
  name: string; phone: string; service: string; quantity: number; location: string
  notes: string; preferredDate: string; preferredPeriod: string; photos: string[]
}): QuoteRequest {
  let customer = findCustomerByPhone(p.phone)
  const t = now()
  if (!customer) {
    customer = { id: uid(), name: p.name, phone: p.phone, address: p.location, neighborhood: '', city: 'Brasília', notes: '', createdAt: t, updatedAt: t }
    const c = customer
    update((db) => ({ ...db, customers: [c, ...db.customers] }))
  } else if (customer.name.trim().toLowerCase() !== p.name.trim().toLowerCase() && !customer.needsReview) {
    const id = customer.id
    update((db) => ({ ...db, customers: db.customers.map((c) => (c.id === id ? { ...c, needsReview: true } : c)) }))
  }
  const req: QuoteRequest = {
    id: uid(), customerId: customer.id, service: p.service, quantity: p.quantity, location: p.location,
    notes: customer.name !== p.name ? `${p.notes}${p.notes ? '\n' : ''}[Nome informado no formulário: ${p.name}]` : p.notes,
    preferredDate: p.preferredDate, preferredPeriod: p.preferredPeriod, status: 'novo', quoteValue: null,
    photos: p.photos, createdAt: t, updatedAt: t,
  }
  update((db) => ({ ...db, requests: [req, ...db.requests] }))
  return req
}

export function updateRequest(id: string, patch: Partial<QuoteRequest>) {
  update((db) => ({ ...db, requests: db.requests.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r)) }))
}

export function saveAppointment(input: Partial<Appointment> & Pick<Appointment, 'start' | 'end' | 'service'>): Appointment {
  const db = getDB()
  const kind = input.kind ?? 'appointment'
  const err = checkAvailability(input.start, input.end, db.appointments, db.hours, { ignoreId: input.id, isBlock: kind === 'block' })
  if (err) throw new RepoError(err)
  if (kind === 'appointment' && !input.customerId) throw new RepoError('Selecione o cliente.')
  const t = now()
  const ex = input.id ? db.appointments.find((a) => a.id === input.id) : undefined
  const saved: Appointment = {
    status: kind === 'block' ? 'confirmado' : 'aguardando_confirmacao', notes: '', ...(ex ?? { createdAt: t }), ...input,
    kind, id: ex?.id ?? uid(), updatedAt: t,
  } as Appointment
  update((d) => ({ ...d, appointments: ex ? d.appointments.map((a) => (a.id === ex.id ? saved : a)) : [...d.appointments, saved] }))
  if (saved.requestId && saved.kind === 'appointment') updateRequest(saved.requestId, { appointmentId: saved.id, status: saved.status })
  return saved
}

export function setAppointmentStatus(id: string, status: Status) {
  update((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === id ? { ...a, status, updatedAt: now() } : a)) }))
  const a = getDB().appointments.find((x) => x.id === id)
  if (a?.requestId) updateRequest(a.requestId, { status })
}
export function deleteBlock(id: string) {
  update((d) => ({ ...d, appointments: d.appointments.filter((a) => a.id !== id) }))
}

/** Converte solicitação em agendamento pendente de confirmação (nunca confirma sozinho). */
export function convertRequestToAppointment(req: QuoteRequest, start: string, durationMin = 120) {
  return saveAppointment({
    kind: 'appointment', customerId: req.customerId, requestId: req.id, service: req.service,
    start, end: addMinutes(new Date(start), durationMin).toISOString(), status: 'aguardando_confirmacao',
    notes: req.notes,
  })
}

/**
 * Registra um atendimento realizado:
 * grava a visita (com coordenadas), vincula cliente/equipamento, calcula a próxima manutenção,
 * cria o lembrete, atualiza o equipamento e conclui o agendamento de origem.
 */
export function completeVisit(input: {
  customerId: string; equipmentId?: string | null; appointmentId?: string | null; service: string; date: string
  notes: string; photos: string[]; address: string; lat: number; lng: number
  intervalMonths?: number | null; specificDate?: string | null
}): Visit {
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) throw new RepoError('Posicione o pino no mapa antes de salvar.')
  const next = computeNextMaintenance(input.date, { intervalMonths: input.intervalMonths, specificDate: input.specificDate })
  const t = now()
  const visit: Visit = {
    id: uid(), customerId: input.customerId, equipmentId: input.equipmentId ?? null, appointmentId: input.appointmentId ?? null,
    service: input.service, date: input.date, notes: input.notes, photos: input.photos, address: input.address,
    lat: input.lat, lng: input.lng, intervalMonths: input.intervalMonths ?? null, nextMaintenanceAt: next, createdAt: t, updatedAt: t,
  }
  update((db) => {
    const reminders: Reminder[] = next
      ? [{ id: uid(), customerId: visit.customerId, equipmentId: visit.equipmentId, visitId: visit.id, dueDate: next, status: 'pendente', createdAt: t, updatedAt: t },
         ...db.reminders.map((r) => (r.equipmentId && r.equipmentId === visit.equipmentId && r.status === 'pendente' ? { ...r, status: 'concluido' as const } : r))]
      : db.reminders
    return {
      ...db,
      visits: [visit, ...db.visits],
      reminders,
      equipment: db.equipment.map((e) => (e.id === visit.equipmentId ? { ...e, lastServiceAt: visit.date, nextMaintenanceAt: next, updatedAt: t } : e)),
      appointments: db.appointments.map((a) => (a.id === visit.appointmentId ? { ...a, status: 'concluido' as const, updatedAt: t } : a)),
      requests: db.requests.map((r) => (visit.appointmentId && r.appointmentId === visit.appointmentId ? { ...r, status: 'concluido' as const, updatedAt: t } : r)),
    }
  })
  return visit
}

export function setReminderStatus(id: string, status: Reminder['status']) {
  update((d) => ({ ...d, reminders: d.reminders.map((r) => (r.id === id ? { ...r, status, updatedAt: now() } : r)) }))
}
export function saveHours(hours: import('../types').BusinessHour[]) { update((d) => ({ ...d, hours })) }
export const fmtDate = (d: string) => format(new Date(d.length === 10 ? `${d}T00:00:00` : d), 'dd/MM/yyyy')
