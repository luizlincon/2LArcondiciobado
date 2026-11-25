import { Link } from 'react-router-dom'

/** MODELO. Deve ser revisado por profissional jurídico antes da publicação (LGPD). */
export default function Privacy() {
  return (
    <main className="lux min-h-screen"><div className="container-x max-w-3xl py-16">
      <Link to="/" className="text-sm font-semibold text-electric-600">← Voltar ao site</Link>
      <h1 className="mt-4 text-3xl font-extrabold">Política de Privacidade</h1>
      <div className="mt-6 space-y-4 text-muted">
        <p>A 2L Ar Condicionado coleta, por meio do formulário de orçamento, os dados necessários para atender sua solicitação: nome, WhatsApp, endereço ou região, informações do serviço desejado, observações e fotos do equipamento.</p>
        <p>Esses dados são usados exclusivamente para elaborar o orçamento, entrar em contato, agendar e registrar o atendimento e acompanhar a manutenção do seu equipamento. Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.</p>
        <p>Os dados ficam armazenados em ambiente com acesso restrito à equipe da 2L. Fotos e endereços não são exibidos publicamente.</p>
        <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo nosso WhatsApp.</p>
      </div>
    </div></main>
  )
}
