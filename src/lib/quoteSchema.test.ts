import { quoteSchema, validatePhoto } from './quoteSchema'

const ok = { name: 'Maria Silva', whatsapp: '(61) 99441-5050', service: 'higienizacao', quantity: '2', location: 'Asa Norte' }

describe('quoteSchema', () => {
  it('aceita dados válidos e coage quantidade', () => {
    const r = quoteSchema.safeParse(ok)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.quantity).toBe(2)
  })
  it.each([['name', ''], ['whatsapp', '123'], ['service', 'x'], ['quantity', '0'], ['location', '']])('exige %s válido', (k, val) =>
    expect(quoteSchema.safeParse({ ...ok, [k]: val }).success).toBe(false))
  it('fotos e observações são opcionais', () => expect(quoteSchema.safeParse(ok).success).toBe(true))
})
describe('validatePhoto', () => {
  it('aceita jpeg pequeno', () => expect(validatePhoto({ name: 'a.jpg', type: 'image/jpeg', size: 1000 })).toBeNull())
  it('rejeita pdf', () => expect(validatePhoto({ name: 'a.pdf', type: 'application/pdf', size: 1000 })).toMatch(/formato/))
  it('rejeita acima de 8MB', () => expect(validatePhoto({ name: 'a.png', type: 'image/png', size: 9e6 })).toMatch(/8 MB/))
})
