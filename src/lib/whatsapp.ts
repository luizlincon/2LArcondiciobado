import { config } from './config'

/** Link wa.me para a conversa com a 2L (uso público). */
export function companyWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${config.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Link wa.me para conversar com um cliente (uso administrativo). Assume DDD brasileiro. */
export function customerWhatsAppLink(phoneNormalized: string, message?: string): string {
  const base = `https://wa.me/55${phoneNormalized}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export const DEFAULT_CTA_MESSAGE =
  'Olá! Vim pelo site da 2L Ar Condicionado e gostaria de solicitar um orçamento.'
