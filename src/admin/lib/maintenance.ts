import { addMonths, format, isValid, parseISO, startOfDay, differenceInCalendarDays } from 'date-fns'

/** Próxima manutenção = data específica (se informada) ou data do atendimento + intervalo em meses. */
export function computeNextMaintenance(
  visitDate: string,
  opts: { intervalMonths?: number | null; specificDate?: string | null },
): string | null {
  if (opts.specificDate) {
    const d = parseISO(opts.specificDate)
    return isValid(d) ? format(d, 'yyyy-MM-dd') : null
  }
  if (opts.intervalMonths && opts.intervalMonths > 0) {
    const base = parseISO(visitDate)
    if (!isValid(base)) return null
    return format(addMonths(base, opts.intervalMonths), 'yyyy-MM-dd')
  }
  return null
}

export type DueState = 'vencida' | 'proxima' | 'futura'
/** vencida: data passada; próxima: dentro de `windowDays`; futura: depois. */
export function dueState(dueDate: string, today = new Date(), windowDays = 30): DueState {
  const diff = differenceInCalendarDays(parseISO(dueDate), startOfDay(today))
  return diff < 0 ? 'vencida' : diff <= windowDays ? 'proxima' : 'futura'
}
