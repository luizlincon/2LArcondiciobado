import { useEffect } from 'react'
import Header from '@/components/lux/Header'
import { Experience, Faq, FinalCta, FloatingWhatsApp, Footer, Gallery, Hero, Positioning, Process, Region, Services } from '@/components/lux/Sections'

export default function Landing() {
  useEffect(() => { document.title = 'Climatização residencial em Brasília e DF | 2L Ar Condicionado' }, [])
  return (
    <div className="lux">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:p-3">Ir para o conteúdo</a>
      <Header />
      <main id="conteudo">
        <Hero /><Positioning /><Services /><Experience /><Process /><Gallery /><Region /><Faq /><FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
