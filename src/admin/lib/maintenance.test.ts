import { computeNextMaintenance, dueState } from './maintenance'
import { checkAvailability } from './schedule'
import type { Appointment, BusinessHour } from '../types'

describe('computeNextMaintenance', () => {
  it('exemplo do briefing: 15/11/2026 + 6 meses = 15/05/2027', () =>
    expect(computeNextMaintenance('2026-11-15', { intervalMonths: 6 })).toBe('2027-05-15'))
  it('data específica tem prioridade', () =>
    expect(computeNextMaintenance('2026-11-15', { intervalMonths: 6, specificDate: '2027-01-10' })).toBe('2027-01-10'))
  it('fim de mês não estoura', () => expect(computeNextMaintenance('2026-08-31', { intervalMonths: 6 })).toBe('2027-02-28'))
  it('sem recomendação, retorna null', () => expect(computeNextMaintenance('2026-11-15', {})).toBeNull())
})
describe('dueState', () => {
  const today = new Date(2026, 10, 16)
  it('vencida', () => expect(dueState('2026-11-15', today)).toBe('vencida'))
  it('próxima', () => expect(dueState('2026-12-01', today)).toBe('proxima'))
  it('futura', () => expect(dueState('2027-05-15', today)).toBe('futura'))
})
describe('checkAvailability', () => {
  const hours: BusinessHour[] = [1, 2, 3, 4, 5].map((w) => ({ weekday: w, enabled: true, open: '08:00', close: '18:00' }))
  const mk = (s: string, e: string, kind: 'appointment' | 'block' = 'appointment', status: Appointment['status'] = 'confirmado'): Appointment =>
    ({ id: 'a1', kind, service: 'x', start: s, end: e, status, notes: '', createdAt: '', updatedAt: '' })
  const mon = (h: number) => new Date(2026, 10, 16, h).toISOString() // 16/11/2026 é segunda
  it('livre', () => expect(checkAvailability(mon(9), mon(11), [], hours)).toBeNull())
  it('conflito', () => expect(checkAvailability(mon(10), mon(12), [mk(mon(9), mon(11))], hours)).toMatch(/Conflito/))
  it('cancelado não conflita', () => expect(checkAvailability(mon(10), mon(12), [mk(mon(9), mon(11), 'appointment', 'cancelado')], hours)).toBeNull())
  it('bloqueio impede', () => expect(checkAvailability(mon(10), mon(12), [mk(mon(9), mon(11), 'block')], hours)).toMatch(/bloqueado/))
  it('fora do expediente', () => expect(checkAvailability(mon(17), mon(19), [], hours)).toMatch(/Fora do horário/))
  it('domingo fechado', () => expect(checkAvailability(new Date(2026, 10, 15, 9).toISOString(), new Date(2026, 10, 15, 11).toISOString(), [], hours)).toMatch(/não funciona/))
  it('ignora o próprio ao editar', () => expect(checkAvailability(mon(9), mon(11), [mk(mon(9), mon(11))], hours, { ignoreId: 'a1' })).toBeNull())
})
