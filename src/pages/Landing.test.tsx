import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Landing from './Landing'

const renderLanding = () => render(<MemoryRouter><Landing /></MemoryRouter>)
const waLinks = () => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="https://wa.me/"]'))

describe('Landing premium', () => {
  it('mostra o headline e a mensagem central', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sua casa merece um cuidado à altura.')
  })
  it('todos os CTAs de WhatsApp usam o número oficial e mensagem contextualizada', () => {
    renderLanding()
    const links = waLinks()
    expect(links.length).toBeGreaterThanOrEqual(9) // header, hero, 4 serviços, região, final, rodapé, flutuante
    for (const a of links) {
      const u = new URL(a.href)
      expect(u.pathname).toBe('/5561994415050')
      expect(u.searchParams.get('text')).toMatch(/^Olá! Conheci a 2L pelo site/)
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
  })
  it('cada serviço tem CTA próprio com a mensagem do serviço', () => {
    renderLanding()
    const texts = waLinks().map((a) => new URL(a.href).searchParams.get('text') ?? '')
    for (const t of ['limpeza e higienização', 'manutenção preventiva', 'manutenção corretiva', 'instalação de ar-condicionado'])
      expect(texts.some((x) => x.includes(t))).toBe(true)
  })
  it('apresenta os quatro serviços e sete perguntas frequentes', () => {
    renderLanding()
    for (const t of ['Limpeza e higienização', 'Manutenção preventiva', 'Manutenção corretiva', 'Instalação de ar-condicionado'])
      expect(screen.getAllByText(t).length).toBeGreaterThan(0)
    expect(document.querySelectorAll('#faq h3')).toHaveLength(7)
  })
  it('não usa elementos proibidos na nova direção (floco de neve, azul elétrico)', () => {
    const { container } = renderLanding()
    expect(container.innerHTML).not.toMatch(/snow|floco|#008eea|logo-2l/i)
  })
  it('imagens ilustrativas são sinalizadas enquanto não há fotos reais', () => {
    renderLanding()
    expect(screen.getByText(/Imagens ilustrativas/)).toBeInTheDocument()
  })
})
