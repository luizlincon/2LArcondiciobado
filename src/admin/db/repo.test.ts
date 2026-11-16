import { beforeEach } from 'vitest'
import { completeVisit, convertRequestToAppointment, createPublicQuote, RepoError, saveAppointment, saveCustomer, saveEquipment } from './repo'
import { getDB, resetDB } from './store'

beforeEach(() => resetDB())
const quote = (name = 'Maria') => createPublicQuote({ name, phone: '61994415050', service: 'higienizacao', quantity: 1, location: 'Asa Norte', notes: '', preferredDate: '', preferredPeriod: 'manha', photos: [] })

describe('clientes', () => {
  it('não duplica cliente com o mesmo telefone e sinaliza nome divergente', () => {
    quote('Maria'); quote('Maria Silva')
    expect(getDB().customers).toHaveLength(1)
    expect(getDB().customers[0].needsReview).toBe(true)
    expect(getDB().requests).toHaveLength(2)
  })
  it('cadastro manual com telefone existente é recusado', () => {
    quote()
    expect(() => saveCustomer({ name: 'Outro', phone: '61994415050', address: '', neighborhood: '', city: '', notes: '' })).toThrow(RepoError)
  })
})
describe('agenda', () => {
  it('conversão nasce aguardando confirmação e evita conflito', () => {
    const r = quote(); const start = new Date(2026, 10, 17, 9).toISOString() // terça
    const a = convertRequestToAppointment(r, start)
    expect(a.status).toBe('aguardando_confirmacao')
    expect(() => saveAppointment({ customerId: r.customerId, service: 'x', start, end: new Date(2026, 10, 17, 11).toISOString() })).toThrow(/Conflito/)
  })
})
describe('atendimento concluído', () => {
  it('gera visita com coordenadas, atualiza equipamento, lembrete e agendamento', () => {
    const r = quote(); const c = getDB().customers[0]
    saveEquipment({ customerId: c.id, type: 'Split', brand: 'LG', model: 'X', btus: 12000, serial: '', room: 'Sala', photos: [] })
    const eq = getDB().equipment[0]
    const a = convertRequestToAppointment(r, new Date(2026, 10, 17, 9).toISOString())
    const v = completeVisit({ customerId: c.id, equipmentId: eq.id, appointmentId: a.id, service: 'higienizacao', date: '2026-11-15', notes: '', photos: [], address: 'x', lat: -15.79, lng: -47.88, intervalMonths: 6 })
    const db = getDB()
    expect(v.nextMaintenanceAt).toBe('2027-05-15')
    expect(db.equipment[0].nextMaintenanceAt).toBe('2027-05-15')
    expect(db.reminders).toHaveLength(1)
    expect(db.appointments[0].status).toBe('concluido')
    expect(db.requests[0].status).toBe('concluido')
  })
  it('exige coordenadas', () => {
    quote(); const c = getDB().customers[0]
    expect(() => completeVisit({ customerId: c.id, service: 'x', date: '2026-11-15', notes: '', photos: [], address: 'x', lat: NaN, lng: NaN })).toThrow(/pino/)
  })
  it('duas visitas do mesmo cliente geram dois pinos e só um lembrete pendente por equipamento', () => {
    quote(); const c = getDB().customers[0]
    saveEquipment({ customerId: c.id, type: 'Split', brand: 'LG', model: 'X', btus: null, serial: '', room: '', photos: [] })
    const e = getDB().equipment[0].id
    for (const d of ['2026-05-01', '2026-11-01']) completeVisit({ customerId: c.id, equipmentId: e, service: 'higienizacao', date: d, notes: '', photos: [], address: 'x', lat: -15.8, lng: -47.9, intervalMonths: 6 })
    expect(getDB().visits).toHaveLength(2)
    expect(getDB().reminders.filter((r) => r.status === 'pendente')).toHaveLength(1)
  })
})
