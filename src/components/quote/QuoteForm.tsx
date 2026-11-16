import { useRef, useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react'
import { isDemoMode } from '@/lib/config'
import { PERIODS, quoteSchema } from '@/lib/quoteSchema'
import { formatPhone } from '@/lib/phone'
import { SERVICES, serviceTitle } from '@/lib/services'
import { companyWhatsAppLink } from '@/lib/whatsapp'
import { QuoteSubmitError, submitQuote } from '@/services/quoteService'
import PhotoUploader from './PhotoUploader'

type Values = {
  name: string; whatsapp: string; service: string; quantity: string
  location: string; notes: string; preferredDate: string; preferredPeriod: string
}
const empty: Values = {
  name: '', whatsapp: '', service: 'higienizacao', quantity: '1',
  location: '', notes: '', preferredDate: '', preferredPeriod: 'indiferente',
}

function Field({ id, label, required, error, hint, children }: {
  id: string; label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label} {required ? <span aria-hidden className="text-electric-600">*</span> : <span className="font-normal text-muted">(opcional)</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  )
}

export default function QuoteForm() {
  const [v, setV] = useState<Values>(empty)
  const [photos, setPhotos] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState<{ service: string; name: string } | null>(null)
  const lock = useRef(false) // bloqueia duplo clique antes do re-render
  const idemKey = useRef(crypto.randomUUID())

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: k === 'whatsapp' ? formatPhone(e.target.value) : e.target.value }))
  const ariaFor = (k: string) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-err` : undefined })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (lock.current) return
    setServerError(null)
    const parsed = quoteSchema.safeParse(v)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message
      setErrors(errs)
      document.getElementById(Object.keys(errs)[0])?.focus()
      return
    }
    setErrors({})
    lock.current = true
    setSubmitting(true)
    try {
      await submitQuote(parsed.data, photos, idemKey.current)
      setDone({ service: serviceTitle(parsed.data.service), name: parsed.data.name.split(' ')[0] })
    } catch (err) {
      setServerError(err instanceof QuoteSubmitError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      lock.current = false
      setSubmitting(false)
    }
  }

  if (done) {
    const msg = `Olá! Sou ${done.name}. Acabei de enviar uma solicitação de orçamento (${done.service}) pelo site da 2L.`
    return (
      <div role="status" className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <CheckCircle2 className="mx-auto h-12 w-12 text-electric" aria-hidden />
        <h3 className="mt-4 text-2xl font-extrabold">Solicitação recebida, {done.name}!</h3>
        <p className="mt-2 text-muted">
          Vamos analisar as informações e entrar em contato pelo WhatsApp com o orçamento. O horário
          que você sugeriu é uma preferência e será confirmado por nós.
        </p>
        <a href={companyWhatsAppLink(msg)} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6">
          <MessageCircle className="h-5 w-5" aria-hidden /> Continuar pelo WhatsApp
        </a>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl bg-white p-6 shadow-xl sm:p-8" aria-busy={submitting}>
      {isDemoMode() && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>Modo demonstração:</strong> o envio fica salvo apenas neste navegador e aparece em <a className="underline" href="/admin">/admin</a>. Nada é enviado à 2L.
        </p>
      )}
      <Field id="name" label="Nome" required error={errors.name}>
        <input id="name" className="field" autoComplete="name" value={v.name} onChange={set('name')} disabled={submitting} {...ariaFor('name')} />
      </Field>
      <Field id="whatsapp" label="WhatsApp" required error={errors.whatsapp}>
        <input id="whatsapp" className="field" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(61) 99999-9999"
          value={v.whatsapp} onChange={set('whatsapp')} disabled={submitting} {...ariaFor('whatsapp')} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
        <Field id="service" label="Serviço desejado" required error={errors.service}>
          <select id="service" className="field" value={v.service} onChange={set('service')} disabled={submitting} {...ariaFor('service')}>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>
        <Field id="quantity" label="Aparelhos" required error={errors.quantity}>
          <input id="quantity" className="field" type="number" min={1} max={50} inputMode="numeric" value={v.quantity} onChange={set('quantity')} disabled={submitting} {...ariaFor('quantity')} />
        </Field>
      </div>
      <Field id="location" label="Endereço ou região" required error={errors.location} hint="Ex.: Asa Norte, SQN 305, Brasília-DF">
        <input id="location" className="field" autoComplete="street-address" value={v.location} onChange={set('location')} disabled={submitting} {...ariaFor('location')} />
      </Field>
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-navy">
          Fotos do equipamento <span className="font-normal text-muted">(recomendado)</span>
        </span>
        <PhotoUploader files={photos} onChange={setPhotos} disabled={submitting} />
        <p className="mt-1 text-xs text-muted">Fotos ajudam a 2L a preparar um orçamento mais preciso.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="preferredDate" label="Data de preferência" error={errors.preferredDate}>
          <input id="preferredDate" className="field" type="date" min={today} value={v.preferredDate} onChange={set('preferredDate')} disabled={submitting} {...ariaFor('preferredDate')} />
        </Field>
        <Field id="preferredPeriod" label="Período">
          <select id="preferredPeriod" className="field" value={v.preferredPeriod} onChange={set('preferredPeriod')} disabled={submitting}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </Field>
      </div>
      <Field id="notes" label="Observações" error={errors.notes}>
        <textarea id="notes" rows={3} className="field" value={v.notes} onChange={set('notes')} disabled={submitting} {...ariaFor('notes')} />
      </Field>

      {serverError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {serverError}{' '}
          <a className="font-semibold underline" href={companyWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            Falar pelo WhatsApp
          </a>
        </div>
      )}
      <button type="submit" disabled={submitting} className="btn btn-primary w-full text-base">
        {submitting ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Enviando...</> : 'Solicitar orçamento'}
      </button>
      <p className="text-center text-xs text-muted">
        Orçamento personalizado e sem compromisso. A data escolhida é uma preferência e depende de confirmação.
      </p>
    </form>
  )
}
