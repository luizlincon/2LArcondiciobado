import { MapPin, MessageCircle, ClipboardCheck, Camera } from 'lucide-react'
import logo from '@/assets/logo-2l.png'
import { companyWhatsAppLink, DEFAULT_CTA_MESSAGE } from '@/lib/whatsapp'

const trust = [
  { icon: MapPin, text: 'Atendimento em Brasília-DF' },
  { icon: Camera, text: 'Orçamento a partir de fotos do seu aparelho' },
  { icon: ClipboardCheck, text: 'Histórico e lembrete de manutenção' },
]

export default function Hero() {
  return (
    <section id="top" className="bg-navy text-white">
      <div className="container-x grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow !text-sky-300">Higienização de ar-condicionado em Brasília-DF</p>
          <h1 className="text-4xl font-extrabold leading-[1.08] !text-white sm:text-5xl lg:text-6xl">
            Seu <span className="whitespace-nowrap">ar-condicionado</span> limpo e sempre em dia.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-200">
            A 2L cuida da higienização e da manutenção do seu aparelho com organização e cuidado técnico.
            Envie fotos, receba um orçamento personalizado e agende o atendimento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#orcamento" className="btn btn-primary text-base">SOLICITAR ORÇAMENTO</a>
            <a href={companyWhatsAppLink(DEFAULT_CTA_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light text-base">
              <MessageCircle className="h-5 w-5" aria-hidden /> Falar no WhatsApp
            </a>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-2xl bg-white p-6 shadow-2xl">
            <img src={logo} alt="" className="mx-auto h-36 w-auto" width={234} height={144} />
            <ul className="mt-4 space-y-3 border-t border-silver pt-4">
              {trust.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm font-medium text-navy">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-electric" aria-hidden /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
