import { z } from 'zod'
import { normalizePhone } from './phone'
import { SERVICE_IDS } from './services'

export const PHOTO_MAX_COUNT = 6
export const PHOTO_MAX_BYTES = 8 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const

export const PERIODS = [
  { id: 'manha', label: 'Manhã' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'indiferente', label: 'Tanto faz' },
] as const

export const quoteSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo').max(120, 'Nome muito longo'),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'Informe seu WhatsApp')
    .refine((v) => normalizePhone(v) !== null, 'Informe um número válido com DDD, ex.: (61) 99999-9999'),
  service: z.enum(SERVICE_IDS, { message: 'Escolha o serviço desejado' }),
  quantity: z.coerce
    .number({ message: 'Informe a quantidade de aparelhos' })
    .int('Use um número inteiro')
    .min(1, 'Mínimo de 1 aparelho')
    .max(50, 'Para mais de 50 aparelhos, fale conosco pelo WhatsApp'),
  location: z.string().trim().min(3, 'Informe o endereço ou a região').max(250, 'Texto muito longo'),
  notes: z.string().trim().max(1000, 'Máximo de 1000 caracteres').optional().default(''),
  preferredDate: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Data inválida'),
  preferredPeriod: z.enum(['manha', 'tarde', 'indiferente']).optional().default('indiferente'),
})

export type QuoteFormInput = z.input<typeof quoteSchema>
export type QuoteFormData = z.output<typeof quoteSchema>

/** Retorna mensagem de erro se o arquivo for inválido, ou null se estiver ok. */
export function validatePhoto(file: { type: string; size: number; name: string }): string | null {
  const okType = (PHOTO_TYPES as readonly string[]).includes(file.type) || /\.(heic|heif)$/i.test(file.name)
  if (!okType) return `"${file.name}": formato não aceito. Use JPG, PNG, WEBP ou HEIC.`
  if (file.size > PHOTO_MAX_BYTES) return `"${file.name}": arquivo maior que 8 MB.`
  if (file.size === 0) return `"${file.name}": arquivo vazio.`
  return null
}
