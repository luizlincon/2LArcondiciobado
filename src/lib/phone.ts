/**
 * Normaliza um telefone brasileiro para apenas dígitos, sem DDI (ex.: 61994415050).
 * Retorna null se não for um número válido (fixo com 10 dígitos ou celular com 11).
 * É a chave usada para identificar clientes e evitar duplicidade.
 */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (d.length !== 10 && d.length !== 11) return null
  const ddd = Number(d.slice(0, 2))
  if (ddd < 11 || ddd > 99) return null
  if (d.length === 11 && d[2] !== '9') return null
  if (d.length === 10 && !/[2-5]/.test(d[2])) return null
  return d
}

/** Máscara de exibição enquanto o usuário digita: (61) 99441-5050 */
export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
