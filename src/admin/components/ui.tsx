import { useEffect, type ReactNode } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { STATUS_LABEL, type Status } from '../types'
import { customerWhatsAppLink } from '@/lib/whatsapp'

const tone: Record<Status, string> = {
  novo: 'bg-sky-100 text-sky-800', em_analise: 'bg-indigo-100 text-indigo-800', aguardando_confirmacao: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-emerald-100 text-emerald-800', concluido: 'bg-slate-200 text-slate-700', cancelado: 'bg-red-100 text-red-700',
}
export const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[status]}`}>{STATUS_LABEL[status]}</span>
)

export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Empty = ({ title, text, action }: { title: string; text?: string; action?: ReactNode }) => (
  <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
    <p className="font-display text-lg font-bold text-navy">{title}</p>
    {text && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const PageHeader = ({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{sub && <p className="text-sm text-muted">{sub}</p>}</div>
    <div className="flex flex-wrap gap-2">{actions}</div>
  </div>
)

export const FormField = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
  </label>
)

export const FormError = ({ msg }: { msg: string | null }) =>
  msg ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">{msg}</p> : null

export const WhatsAppButton = ({ phone, message, label = 'WhatsApp' }: { phone: string; message?: string; label?: string }) => (
  <a href={customerWhatsAppLink(phone, message)} target="_blank" rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
    <MessageCircle className="h-4 w-4" aria-hidden /> {label}
  </a>
)

export const card = 'rounded-xl border border-silver bg-white p-4 shadow-sm'
export const btnSm = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-navy hover:bg-mist disabled:opacity-50'
export const btnPri = 'inline-flex items-center gap-1.5 rounded-lg bg-electric px-4 py-2 text-sm font-bold text-white hover:bg-electric-600 disabled:opacity-50'
export const btnDanger = 'inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50'

export const fmtPhone = (p: string) => (p.length === 11 ? `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}` : `(${p.slice(0, 2)}) ${p.slice(2, 6)}-${p.slice(6)}`)
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
