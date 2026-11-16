import type { Appointment, BusinessHour } from '../types'

export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)

const hhmm = (d: Date) => d.getHours() * 60 + d.getMinutes()
const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5))

/** Retorna mensagem de erro se o intervalo não puder ser agendado; null se livre. */
export function checkAvailability(
  start: string, end: string, existing: Appointment[], hours: BusinessHour[],
  opts: { ignoreId?: string; isBlock?: boolean } = {},
): string | null {
  const s = new Date(start), e = new Date(end)
  if (!(s < e)) return 'O horário final deve ser depois do inicial.'
  if (!opts.isBlock) {
    if (s.toDateString() !== e.toDateString()) return 'O atendimento deve começar e terminar no mesmo dia.'
    const h = hours.find((x) => x.weekday === s.getDay())
    if (!h || !h.enabled) return 'A empresa não funciona neste dia da semana.'
    if (hhmm(s) < toMin(h.open) || hhmm(e) > toMin(h.close)) return `Fora do horário de funcionamento (${h.open} às ${h.close}).`
  }
  const clash = existing.find(
    (a) => a.id !== opts.ignoreId && a.status !== 'cancelado' && !a.deletedAt && overlaps(start, end, a.start, a.end),
  )
  if (clash) return clash.kind === 'block' ? `Período bloqueado${clash.notes ? `: ${clash.notes}` : ''}.` : 'Conflito com outro agendamento neste horário.'
  return null
}
