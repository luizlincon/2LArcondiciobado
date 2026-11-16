import { useSyncExternalStore } from 'react'
import type { BusinessHour, DB } from '../types'

const KEY = '2l-demo-db-v1'
export const defaultHours = (): BusinessHour[] =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, enabled: weekday >= 1 && weekday <= 5, open: '08:00', close: '18:00' }))
const emptyDB = (): DB => ({ customers: [], equipment: [], requests: [], appointments: [], visits: [], reminders: [], hours: defaultHours() })

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...emptyDB(), ...JSON.parse(raw) }
  } catch { /* storage indisponível */ }
  return emptyDB()
}

let state: DB = load()
const listeners = new Set<() => void>()

export const getDB = () => state
export function setDB(next: DB) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* cota cheia: mantém em memória */ }
  listeners.forEach((l) => l())
}
export const update = (fn: (db: DB) => DB) => setDB(fn(state))
export const resetDB = () => setDB(emptyDB())
export const useDB = (): DB => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), getDB)

export const uid = () => crypto.randomUUID()
export const now = () => new Date().toISOString()
