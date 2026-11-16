import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '@/assets/logo-2l.png'

const links = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#diferenciais', label: 'Sobre a empresa' },
  { href: '#orcamento', label: 'Contato' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-silver bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#top" aria-label="2L Ar Condicionado, início">
          <img src={logo} alt="2L Ar Condicionado" className="h-11 w-auto" width={72} height={44} />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-navy hover:text-electric-600">{l.label}</a>
          ))}
          <a href="#orcamento" className="btn btn-primary min-h-10 py-2">SOLICITAR ORÇAMENTO</a>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <a href="#orcamento" className="btn btn-primary min-h-10 px-4 py-2 text-xs">ORÇAMENTO</a>
          <button type="button" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 text-navy">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-silver bg-white md:hidden">
          <ul className="container-x py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block py-3 font-semibold text-navy">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
