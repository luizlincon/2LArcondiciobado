import { config, isBackendConfigured } from '@/lib/config'
import type { QuoteFormData } from '@/lib/quoteSchema'
import { normalizePhone } from '@/lib/phone'

export class QuoteSubmitError extends Error {
  constructor(message: string, public readonly code: 'not_configured' | 'network' | 'rejected' | 'rate_limited') {
    super(message)
  }
}

/**
 * Envia a solicitação para a Edge Function `submit-quote` (Fase 2).
 * A função valida de novo no servidor, aplica rate limit, cria/reaproveita o cliente
 * pelo telefone normalizado e grava a solicitação e as fotos em storage privado.
 * `idempotencyKey` impede duplicidade se o envio for repetido.
 */
export async function submitQuote(
  data: QuoteFormData,
  photos: File[],
  idempotencyKey: string,
): Promise<{ id: string }> {
  if (!isBackendConfigured()) {
    throw new QuoteSubmitError('O envio online ainda não está disponível neste ambiente.', 'not_configured')
  }
  const form = new FormData()
  form.set('idempotency_key', idempotencyKey)
  form.set('name', data.name)
  form.set('whatsapp', normalizePhone(data.whatsapp) ?? data.whatsapp)
  form.set('service', data.service)
  form.set('quantity', String(data.quantity))
  form.set('location', data.location)
  form.set('notes', data.notes ?? '')
  form.set('preferred_date', data.preferredDate ?? '')
  form.set('preferred_period', data.preferredPeriod ?? 'indiferente')
  photos.forEach((p) => form.append('photos', p, p.name))

  let res: Response
  try {
    res = await fetch(`${config.supabaseUrl}/functions/v1/submit-quote`, {
      method: 'POST',
      headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}` },
      body: form,
    })
  } catch {
    throw new QuoteSubmitError('Não foi possível conectar. Verifique sua internet e tente novamente.', 'network')
  }
  if (res.status === 429) {
    throw new QuoteSubmitError('Muitas tentativas. Aguarde alguns minutos ou fale conosco pelo WhatsApp.', 'rate_limited')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new QuoteSubmitError(body?.error ?? 'Não foi possível enviar sua solicitação.', 'rejected')
  }
  return (await res.json()) as { id: string }
}
