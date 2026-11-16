import { formatPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it.each([
    ['(61) 99441-5050', '61994415050'],
    ['+55 61 99441-5050', '61994415050'],
    ['5561994415050', '61994415050'],
    ['(61) 3322-1100', '6133221100'],
  ])('aceita %s', (i, o) => expect(normalizePhone(i)).toBe(o))
  it.each(['', '123', '(61) 89441-5050', '(05) 99441-5050', '(61) 1322-1100', 'abc'])('rejeita "%s"', (i) =>
    expect(normalizePhone(i)).toBeNull())
  it('mesmo número em formatos diferentes gera a mesma chave', () =>
    expect(normalizePhone('61 99441 5050')).toBe(normalizePhone('+5561994415050')))
})
describe('formatPhone', () => {
  it('aplica máscara', () => expect(formatPhone('61994415050')).toBe('(61) 99441-5050'))
})
