import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Brand from './Brand'
import { companyWhatsAppLink } from '@/lib/whatsapp'
import { MSG } from '@/content/messages'

const links = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#experiencia', label: 'Experiência 2L' },
  { href: '#processo', label: 'Atendimento' },
  { href: '#regiao', label: 'Região' },
  { href: '#faq', label: 'Dúvidas' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#topo" aria-label="2L Ar Condicionado, início"><Brand /></a>
        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm text-slate2 transition-colors hover:text-ink">{l.label}</a>)}
          <a href={companyWhatsAppLink(MSG.header)} target="_blank" rel="noopener noreferrer" className="lux-btn min-h-10 px-5 py-2">Solicitar orçamento</a>
        </nav>
        <button type="button" className="p-2 text-ink lg:hidden" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-ink/10 bg-paper lg:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-3">
            {links.map((l) => <li key={l.href}><a href={l.href} onClick={() => setOpen(false)} className="block py-3 font-display text-lg text-ink">{l.label}</a></li>)}
            <li className="pb-3 pt-2"><a href={companyWhatsAppLink(MSG.header)} target="_blank" rel="noopener noreferrer" className="lux-btn w-full">Solicitar orçamento</a></li>
          </ul>
        </nav>
      )}
    </header>
  )
}
