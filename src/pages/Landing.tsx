import { useEffect } from 'react'
import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import { BeforeAfter, Benefits, Differentials, Faq, FinalCta, Footer, HowItWorks, Problem, Services } from '@/components/landing/Sections'
import QuoteForm from '@/components/quote/QuoteForm'

export default function Landing() {
  useEffect(() => { document.title = 'Higienização de Ar-Condicionado em Brasília-DF | 2L Ar Condicionado' }, [])
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Ir para o conteúdo</a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Problem />
        <Benefits />
        <BeforeAfter />
        <HowItWorks />
        <Services />
        <Differentials />
        <section id="orcamento" className="section bg-navy">
          <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="text-white lg:sticky lg:top-24">
              <p className="eyebrow !text-sky-300">Orçamento</p>
              <h2 className="text-3xl font-extrabold !text-white sm:text-4xl">Solicite seu orçamento personalizado</h2>
              <p className="mt-4 text-lg text-slate-200">Conte o que você precisa e envie fotos do aparelho. A 2L analisa e responde pelo WhatsApp.</p>
            </div>
            <QuoteForm />
          </div>
        </section>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
