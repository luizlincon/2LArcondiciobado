export type Status = 'novo' | 'em_analise' | 'aguardando_confirmacao' | 'confirmado' | 'concluido' | 'cancelado'
export const STATUS_LABEL: Record<Status, string> = {
  novo: 'Novo pedido', em_analise: 'Em análise', aguardando_confirmacao: 'Aguardando confirmação',
  confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado',
}
export const STATUS_ORDER: Status[] = ['novo', 'em_analise', 'aguardando_confirmacao', 'confirmado', 'concluido', 'cancelado']

type Base = { id: string; createdAt: string; updatedAt: string; deletedAt?: string | null }

export type Customer = Base & {
  name: string; phone: string /* normalizado, só dígitos */; address: string; neighborhood: string; city: string; notes: string
  needsReview?: boolean // telefone igual com nome diferente: revisão administrativa
}
export type Equipment = Base & {
  customerId: string; type: string; brand: string; model: string; btus: number | null; serial: string; room: string
  photos: string[]; lastServiceAt?: string | null; nextMaintenanceAt?: string | null
}
export type QuoteRequest = Base & {
  customerId: string; service: string; quantity: number; location: string; notes: string
  preferredDate: string; preferredPeriod: string; status: Status; quoteValue: number | null
  photos: string[]; appointmentId?: string | null; demo?: boolean
}
export type Appointment = Base & {
  kind: 'appointment' | 'block'
  customerId?: string | null; requestId?: string | null; equipmentId?: string | null
  service: string; start: string; end: string // ISO
  status: Status; notes: string
}
export type Visit = Base & {
  customerId: string; equipmentId?: string | null; appointmentId?: string | null
  service: string; date: string /* yyyy-MM-dd */; notes: string; photos: string[]
  address: string; lat: number; lng: number
  intervalMonths?: number | null; nextMaintenanceAt?: string | null
}
export type Reminder = Base & {
  customerId: string; equipmentId?: string | null; visitId: string; dueDate: string
  status: 'pendente' | 'contatado' | 'concluido'
}
export type BusinessHour = { weekday: number; enabled: boolean; open: string; close: string }

export type DB = {
  customers: Customer[]; equipment: Equipment[]; requests: QuoteRequest[]; appointments: Appointment[]
  visits: Visit[]; reminders: Reminder[]; hours: BusinessHour[]
}
