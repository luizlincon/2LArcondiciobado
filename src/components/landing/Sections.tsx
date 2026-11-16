import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AirVent, ChevronDown, ClipboardList, Droplets, Filter, History, ImageIcon, Send, Camera,
  CalendarCheck, Wind, Wrench, Sparkles, CalendarClock, MessageCircle, ShieldCheck,
} from 'lucide-react'
import { SERVICES } from '@/lib/services'
import { beforeAfter, faqs } from '@/content'
import { companyWhatsAppLink, DEFAULT_CTA_MESSAGE } from '@/lib/whatsapp'
import logo from '@/assets/logo-2l.png'

function Heading({ eyebrow, title, lead, center }: { eyebrow: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-lg text-muted">{lead}</p>}
    </div>
  )
}

export function Problem() {
  const signs = [
    { icon: Wind, t: 'Poeira acumulada', d: 'Poeira visível no aparelho ou ao redor das saídas de ar.' },
    { icon: Filter, t: 'Filtros sujos', d: 'Filtros com aparência escurecida ou cheios de resíduos.' },
    { icon: Droplets, t: 'Odores desagradáveis', d: 'Cheiro diferente quando o aparelho é ligado.' },
    { icon: Sparkles, t: 'Acúmulo de resíduos', d: 'Sujeira nas partes internas ou na bandeja de dreno.' },
    { icon: CalendarClock, t: 'Sem manutenção periódica', d: 'Já faz tempo desde a última limpeza ou revisão.' },
  ]
  return (
    <section className="section bg-mist">
      <div className="container-x">
        <Heading eyebrow="Reconhece algum destes sinais?" title="Seu ar-condicionado pode estar pedindo atenção" lead="Se algum destes pontos soa familiar, uma avaliação da 2L ajuda a entender o que o seu aparelho precisa." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {signs.map(({ icon: Icon, t, d }) => (
            <li key={t} className="rounded-xl border border-silver bg-white p-5">
              <Icon className="h-7 w-7 text-electric" aria-hidden />
              <h3 className="mt-3 text-base font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Benefits() {
  const items = [
    { icon: AirVent, t: 'Equipamento bem cuidado', d: 'Limpeza e revisão periódicas ajudam a manter o aparelho em boas condições de uso.' },
    { icon: Wind, t: 'Ambiente mais agradável', d: 'Um aparelho limpo contribui para um ambiente com aparência e cheiro mais agradáveis.' },
    { icon: Wrench, t: 'Menos surpresas', d: 'A manutenção preventiva ajuda a identificar problemas antes que virem um conserto maior.' },
    { icon: History, t: 'Histórico do seu aparelho', d: 'Cada atendimento fica registrado, com recomendação da próxima manutenção.' },
  ]
  return (
    <section className="section">
      <div className="container-x">
        <Heading eyebrow="Por que higienizar" title="Benefícios de manter o equipamento limpo e em dia" center />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex gap-4 rounded-xl border border-silver p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-white"><Icon className="h-6 w-6" aria-hidden /></span>
              <div><h3 className="text-lg font-bold">{t}</h3><p className="mt-1 text-muted">{d}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function BeforeAfter() {
  // Sem fotos reais cadastradas, a seção não aparece para visitantes. Em desenvolvimento, mostra o espaço reservado.
  if (beforeAfter.length === 0) {
    if (!import.meta.env.DEV) return null
    return (
      <section className="section bg-mist" data-testid="before-after-placeholder">
        <div className="container-x"><Heading eyebrow="Antes e depois" title="Resultados reais de atendimentos" />
          <p className="mt-6 flex items-center gap-3 break-words rounded-xl border-2 border-dashed border-slate-300 p-6 text-muted">
            <ImageIcon className="h-6 w-6 shrink-0" aria-hidden /> <span className="min-w-0">Modo desenvolvimento: adicione fotos reais em <code>src/content.ts</code> (beforeAfter) e esta seção aparecerá no site.</span>
          </p></div>
      </section>
    )
  }
  return (
    <section className="section bg-mist">
      <div className="container-x">
        <Heading eyebrow="Antes e depois" title="Resultados reais de atendimentos" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {beforeAfter.map((b, i) => (
            <figure key={i} className="overflow-hidden rounded-xl bg-white shadow">
              <div className="grid grid-cols-2">
                <div className="relative"><img loading="lazy" src={b.before} alt="Antes da higienização" className="aspect-[4/3] w-full object-cover" /><span className="absolute left-2 top-2 rounded bg-navy px-2 py-0.5 text-xs font-bold text-white">ANTES</span></div>
                <div className="relative"><img loading="lazy" src={b.after} alt="Depois da higienização" className="aspect-[4/3] w-full object-cover" /><span className="absolute left-2 top-2 rounded bg-electric px-2 py-0.5 text-xs font-bold text-white">DEPOIS</span></div>
              </div>
              {b.caption && <figcaption className="p-3 text-sm text-muted">{b.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    { icon: ClipboardList, t: 'Você solicita o orçamento', d: 'Preencha o formulário em poucos minutos.' },
    { icon: Camera, t: 'Envia fotos do equipamento', d: 'Fotos ajudam a entender o que o aparelho precisa.' },
    { icon: Send, t: 'A 2L analisa e apresenta o orçamento', d: 'Retornamos pelo WhatsApp com o valor.' },
    { icon: CalendarCheck, t: 'O atendimento é agendado e realizado', d: 'Confirmamos o horário e cuidamos do seu aparelho.' },
  ]
  return (
    <section className="section bg-navy text-white">
      <div className="container-x">
        <div className="max-w-2xl"><p className="eyebrow !text-sky-300">Como funciona</p>
          <h2 className="text-3xl font-extrabold !text-white sm:text-4xl">Do pedido ao atendimento, em quatro passos</h2></div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between"><span className="font-display text-4xl font-extrabold text-electric">{i + 1}</span><Icon className="h-6 w-6 text-sky-200" aria-hidden /></div>
              <h3 className="mt-4 text-lg font-bold !text-white">{t}</h3>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Services() {
  const [main, ...rest] = SERVICES
  return (
    <section id="servicos" className="section">
      <div className="container-x">
        <Heading eyebrow="Serviços" title="Tudo o que o seu ar-condicionado precisa" center />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-navy p-8 text-white md:col-span-2 lg:col-span-1 lg:row-span-3">
            <Sparkles className="h-9 w-9 text-electric" aria-hidden />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-sky-300">Principal serviço</p>
            <h3 className="mt-1 text-2xl font-extrabold !text-white">{main.title}</h3>
            <p className="mt-3 text-slate-200">{main.short}</p>
            <a href="#orcamento" className="btn btn-primary mt-6">Solicitar orçamento</a>
          </div>
          {rest.map((s) => (
            <div key={s.id} className="rounded-xl border border-silver p-6">
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.short}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Differentials() {
  const items = [
    { icon: ClipboardList, t: 'Organização', d: 'Pedido, orçamento, agendamento e histórico em um só fluxo.' },
    { icon: MessageCircle, t: 'Atendimento próximo', d: 'Conversa direta pelo WhatsApp, do orçamento ao retorno.' },
    { icon: ShieldCheck, t: 'Cuidado com o equipamento', d: 'Cada aparelho é tratado de acordo com o seu tipo e condição.' },
    { icon: CalendarClock, t: 'Acompanhamento de manutenção', d: 'Registramos o atendimento e lembramos você da próxima revisão.' },
  ]
  return (
    <section id="diferenciais" className="section bg-mist">
      <div className="container-x">
        <Heading eyebrow="Sobre a 2L" title="Seu ar sempre em dia" lead="A 2L Ar Condicionado atua em Brasília-DF com foco em higienização e manutenção de ar-condicionado, combinando atendimento próximo e acompanhamento organizado de cada equipamento." />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, t, d }) => (
            <li key={t} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-silver">
              <Icon className="h-7 w-7 text-electric" aria-hidden />
              <h3 className="mt-3 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="section">
      <div className="container-x max-w-3xl">
        <Heading eyebrow="Perguntas frequentes" title="Tire suas dúvidas" center />
        <div className="mt-10 divide-y divide-silver rounded-xl border border-silver">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <h3>
                <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-display text-base font-bold text-navy">
                  {f.q}<ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} aria-hidden />
                </button>
              </h3>
              {open === i && <p id={`faq-${i}`} className="px-5 pb-5 text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section className="bg-electric py-14 text-white">
      <div className="container-x flex flex-col items-center gap-5 text-center">
        <h2 className="text-3xl font-extrabold !text-white sm:text-4xl">Deixe seu ar-condicionado em dia</h2>
        <p className="max-w-xl text-lg text-white/90">Preencha o formulário, envie fotos e receba um orçamento personalizado da 2L.</p>
        <a href="#orcamento" className="btn bg-navy text-base text-white hover:bg-navy-900">SOLICITAR ORÇAMENTO</a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="container-x grid gap-8 py-12 md:grid-cols-4">
        <div><span className="inline-block rounded-lg bg-white p-2"><img src={logo} alt="2L Ar Condicionado" className="h-14 w-auto" loading="lazy" width={91} height={56} /></span>
          <p className="mt-3 text-sm">Seu ar sempre em dia.</p></div>
        <div><h3 className="text-sm font-bold uppercase tracking-wider !text-white">Serviços</h3>
          <ul className="mt-3 space-y-1 text-sm">{SERVICES.map((s) => <li key={s.id}>{s.title}</li>)}</ul></div>
        <div><h3 className="text-sm font-bold uppercase tracking-wider !text-white">Contato</h3>
          <p className="mt-3 text-sm"><a className="underline" href={companyWhatsAppLink(DEFAULT_CTA_MESSAGE)} target="_blank" rel="noopener noreferrer">WhatsApp: (61) 99441-5050</a></p></div>
        <div><h3 className="text-sm font-bold uppercase tracking-wider !text-white">Região de atendimento</h3>
          <p className="mt-3 text-sm">Brasília-DF</p>
          <p className="mt-3 text-sm"><Link className="underline" to="/privacidade">Política de privacidade</Link></p></div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} 2L Ar Condicionado. Todos os direitos reservados.</p>
    </footer>
  )
}
