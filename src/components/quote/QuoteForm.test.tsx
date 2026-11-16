import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import QuoteForm from './QuoteForm'
import * as svc from '@/services/quoteService'

describe('QuoteForm', () => {
  it('mostra erros e não envia com campos obrigatórios vazios', async () => {
    const spy = vi.spyOn(svc, 'submitQuote')
    render(<QuoteForm />)
    await userEvent.click(screen.getByRole('button', { name: /solicitar orçamento/i }))
    expect(await screen.findByText(/informe seu nome/i)).toBeInTheDocument()
    expect(spy).not.toHaveBeenCalled()
  })
  it('impede envio duplicado por cliques repetidos e mostra confirmação', async () => {
    let resolve!: (v: { id: string }) => void
    const spy = vi.spyOn(svc, 'submitQuote').mockReturnValue(new Promise((r) => (resolve = r)))
    render(<QuoteForm />)
    await userEvent.type(screen.getByLabelText(/^nome/i), 'Maria Silva')
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '61994415050')
    await userEvent.type(screen.getByLabelText(/endereço ou região/i), 'Asa Norte')
    const btn = screen.getByRole('button', { name: /solicitar orçamento/i })
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(spy).toHaveBeenCalledTimes(1)
    resolve({ id: '1' })
    await waitFor(() => expect(screen.getByText(/solicitação recebida/i)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', expect.stringContaining('wa.me/5561994415050'))
  })
  it('exibe erro do servidor e permite nova tentativa', async () => {
    vi.spyOn(svc, 'submitQuote').mockRejectedValue(new svc.QuoteSubmitError('Falhou', 'network'))
    render(<QuoteForm />)
    await userEvent.type(screen.getByLabelText(/^nome/i), 'Maria Silva')
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '61994415050')
    await userEvent.type(screen.getByLabelText(/endereço ou região/i), 'Asa Norte')
    await userEvent.click(screen.getByRole('button', { name: /solicitar orçamento/i }))
    expect(await screen.findByText(/falhou/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /solicitar orçamento/i })).toBeEnabled()
  })
})
