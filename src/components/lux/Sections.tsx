import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, MessageCircle, Plus } from 'lucide-react'
import Brand from './Brand'
import Photo from './Photo'
import Reveal from './Reveal'
import QuoteForm from '@/components/quote/QuoteForm'
import { commitments, concerns, faqs, gallery, regions, services, steps } from '@/content/site'
import { MSG } from '@/content/messages'
import { companyWhatsAppLink } from '@/lib/whatsapp'
import { hasPhoto } from './Photo'

const wa = (m: string) => ({ href: companyWhatsAppLink(m), target: '_blank', rel: 'noopener noreferrer' }) as const

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="lux-eyebrow-dark">Climatização residencial · Brasília e DF</p>
          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-paper sm:text-6xl lg:text-[4.2rem]">
            Sua casa merece um cuidado à altura.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">
            Manutenção, instalação e higienização de ar-condicionado com atendimento profissional, discrição e respeito ao seu ambiente.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a {...wa(MSG.hero)} className="lux-btn"><MessageCircle className="h-5 w-5" aria-hidden /> Solicitar orçamento</a>
            <a href="#servicos" className="inline-flex min-h-12 items-center justify-center px-2 font-display text-sm font-semibold text-paper/85 underline decoration-champagne/60 underline-offset-8 hover:text-paper">Conhecer os serviços</a>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-paper/15 pt-6 text-sm text-paper/65">
            <li>Orçamento personalizado</li><li>Atendimento residencial</li><li>Equipe uniformizada</li>
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="aspect-[4/5] overflow-hidden rounded-t-[12rem] rounded-b-sm ring-1 ring-paper/10 lg:rounded-t-[14rem]">
            <Photo name="hero" alt="Ambiente residencial com ar-condicionado instalado de forma discreta" art="arch" eager />
          </div>
        </div>
      </div>
    </section>
  )
}

export function Positioning() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="lux-eyebrow">Nosso posicionamento</p>
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            Contratar um serviço residencial deveria trazer tranquilidade. Não preocupação.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate2">
            Receber um profissional em casa é um ato de confiança. Por isso, cuidamos de cada ponto que costuma gerar desconforto.
          </p>
        </Reveal>
        <ul className="mt-14 divide-y divide-ink/10 border-y border-ink/10">
          {concerns.map((c, i) => (
            <li key={c.problem}>
              <Reveal delay={i * 60} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.1fr] sm:gap-10">
                <p className="font-display text-lg text-slate2 line-through decoration-champagne/70 decoration-1">{c.problem}</p>
                <p className="font-display text-lg text-ink">{c.answer}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Services() {
  return (
    <section id="servicos" className="bg-paper pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal><p className="lux-eyebrow">Serviços</p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">Especialistas em climatização residencial</h2></Reveal>
        <div className="mt-16 space-y-20 sm:space-y-28">
          {services.map((s, i) => (
            <Reveal key={s.id} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 ? 'md:[&>div:first-child]:order-2' : ''}`}>
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-ink/5 sm:aspect-[5/6]">
                <Photo name={s.photo} alt={`${s.title}: atendimento residencial`} art={s.art} />
              </div>
              <div>
                <p className="font-display text-sm text-champagne-700">0{i + 1}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-4xl">{s.title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-slate2">{s.text}</p>
                <p className="mt-5 border-l-2 border-champagne pl-4 text-ink">{s.benefit}</p>
                <a {...wa(s.message)} className="lux-link mt-8">Solicitar orçamento <ArrowUpRight className="h-4 w-4" aria-hidden /></a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Experience() {
  return (
    <section id="experiencia" className="bg-ink py-20 text-paper sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal><p className="lux-eyebrow-dark">Experiência 2L</p>
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-paper sm:text-5xl">
            Não é apenas sobre executar um serviço. É sobre como você é atendido.
          </h2></Reveal>
        <ol className="mt-14 grid gap-px overflow-hidden bg-paper/15 sm:grid-cols-2 lg:grid-cols-5">
          {commitments.map((c, i) => (
            <li key={c.title} className="bg-ink p-6">
              <Reveal delay={i * 70}>
                <p className="font-display text-sm text-champagne">0{i + 1}</p>
                <h3 className="mt-3 font-display text-lg font-semibold text-paper">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/70">{c.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Process() {
  return (
    <section id="processo" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal><p className="lux-eyebrow">Processo de atendimento</p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">Do primeiro contato ao serviço concluído</h2></Reveal>
        <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="relative border-t border-ink/20 pt-6">
              <Reveal delay={i * 80}>
                <span className="absolute -top-px left-0 h-px w-10 bg-champagne" aria-hidden />
                <p className="font-display text-4xl font-semibold text-champagne-700">{i + 1}</p>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate2">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Gallery() {
  const allReal = gallery.every((g) => hasPhoto(g.photo))
  return (
    <section id="galeria" className="bg-[#ece7db] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal><p className="lux-eyebrow">Galeria</p>
          <h2 className="max-w-2xl font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">O padrão que levamos para dentro da sua casa</h2></Reveal>
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3">
          {gallery.map((g, i) => (
            <Reveal key={g.label} delay={(i % 3) * 80} className={i % 3 === 1 ? 'md:mt-14' : ''}>
              <figure>
                <div className="aspect-[4/5] overflow-hidden rounded-sm">
                  <Photo name={g.photo} alt={g.alt} art={g.art} className="transition-transform duration-700 hover:scale-[1.03]" />
                </div>
                <figcaption className="mt-2 text-xs uppercase tracking-[0.16em] text-slate2">{g.label}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {!allReal && <p className="mt-6 text-xs text-slate2">Imagens ilustrativas. Serão substituídas por fotografias reais de atendimentos da 2L.</p>}
      </div>
    </section>
  )
}

export function Region() {
  return (
    <section id="regiao" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="lux-eyebrow">Região de atendimento</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">Brasília e Distrito Federal</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate2">
            Atendemos residências em Brasília e no Distrito Federal. Se a sua região não estiver na lista, fale conosco para confirmar a disponibilidade.
          </p>
          <a {...wa(MSG.region)} className="lux-link mt-8">Confirmar minha região <ArrowUpRight className="h-4 w-4" aria-hidden /></a>
        </Reveal>
        <Reveal delay={100}>
          <ul className="flex flex-wrap gap-2.5" aria-label="Regiões atendidas">
            {regions.map((r) => <li key={r} className="rounded-full border border-ink/20 px-4 py-2 font-display text-sm text-ink">{r}</li>)}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="bg-[#ece7db] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal><p className="lux-eyebrow">Perguntas frequentes</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">Dúvidas comuns</h2></Reveal>
        <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-base font-medium text-ink sm:text-lg">
                  {f.q}<ChevronDown className={`h-5 w-5 shrink-0 text-champagne-700 transition-transform ${open === i ? 'rotate-180' : ''}`} aria-hidden />
                </button>
              </h3>
              {open === i && <p id={`faq-${i}`} className="pb-6 pr-8 leading-relaxed text-slate2">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  const [showForm, setShowForm] = useState(false)
  return (
    <section id="contato" className="bg-ink py-20 text-paper sm:py-28">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="lux-eyebrow-dark">Orçamento</p>
          <h2 className="font-display text-3xl font-semibold leading-tight text-paper sm:text-5xl">Sua casa merece um atendimento de confiança.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-paper/70">Conte-nos o que você precisa. Retornamos com um orçamento personalizado.</p>
          <a {...wa(MSG.final)} className="lux-btn mt-10"><MessageCircle className="h-5 w-5" aria-hidden /> Solicitar orçamento pelo WhatsApp</a>
          <p className="mt-8 text-sm text-paper/60">
            Prefere enviar detalhes e fotos do equipamento?{' '}
            <button type="button" aria-expanded={showForm} aria-controls="form-orcamento" onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1 text-paper underline decoration-champagne underline-offset-4">
              <Plus className={`h-3.5 w-3.5 transition-transform ${showForm ? 'rotate-45' : ''}`} aria-hidden /> Preencher formulário
            </button>
          </p>
        </Reveal>
        {showForm && <div id="form-orcamento" className="lux mt-10 text-left"><QuoteForm /></div>}
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#0b131b] text-paper/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div><Brand light /><p className="mt-4 text-sm">Sua casa merece um cuidado à altura.</p></div>
        <div><h3 className="font-display text-sm font-semibold text-paper">Serviços</h3>
          <ul className="mt-3 space-y-1.5 text-sm">{services.map((s) => <li key={s.id}>{s.title}</li>)}</ul></div>
        <div><h3 className="font-display text-sm font-semibold text-paper">Contato</h3>
          <p className="mt-3 text-sm"><a {...wa(MSG.final)} className="underline decoration-champagne underline-offset-4 hover:text-paper">WhatsApp</a></p>
          <p className="mt-1 text-sm">Atendimento por orçamento</p></div>
        <div><h3 className="font-display text-sm font-semibold text-paper">Região</h3>
          <p className="mt-3 text-sm">Brasília e Distrito Federal</p>
          <p className="mt-3 text-sm"><Link to="/privacidade" className="underline decoration-champagne underline-offset-4 hover:text-paper">Política de privacidade</Link></p></div>
      </div>
      <p className="border-t border-paper/10 py-5 text-center text-xs">© {new Date().getFullYear()} 2L Ar Condicionado. Todos os direitos reservados.</p>
    </footer>
  )
}

export function FloatingWhatsApp() {
  return (
    <aside aria-label="Atalho para o WhatsApp"><a {...wa(MSG.floating)} aria-label="Solicitar orçamento pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-champagne px-5 font-display text-sm font-semibold text-ink shadow-[0_10px_30px_rgba(17,27,37,0.35)] transition-transform hover:scale-105 sm:bottom-7 sm:right-7">
      <MessageCircle className="h-6 w-6" aria-hidden /><span className="hidden sm:inline">WhatsApp</span>
    </a></aside>
  )
}
