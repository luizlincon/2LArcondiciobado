/**
 * Conteúdo editável da landing. Tudo que depende de confirmação da empresa está marcado com CONFIRMAR.
 * Nenhum endereço, avaliação, certificação ou garantia é inventado.
 */

export const services = [
  {
    id: 'higienizacao', title: 'Limpeza e higienização', art: 'arch' as const,
    text: 'Limpeza técnica do equipamento, executada com método e atenção ao ambiente ao redor.',
    benefit: 'Um equipamento limpo, funcionando como deve, sem transtorno para a casa.',
    message: 'Olá! Conheci a 2L pelo site e gostaria de solicitar um orçamento para limpeza e higienização do meu ar-condicionado residencial.',
    photo: 'servico-higienizacao',
  },
  {
    id: 'preventiva', title: 'Manutenção preventiva', art: 'slats' as const,
    text: 'Revisões periódicas, planejadas conforme o tipo de equipamento e a rotina da residência.',
    benefit: 'Acompanhamento organizado, com menos imprevistos ao longo do tempo.',
    message: 'Olá! Conheci a 2L pelo site e gostaria de solicitar um orçamento para manutenção preventiva do meu ar-condicionado residencial.',
    photo: 'servico-preventiva',
  },
  {
    id: 'corretiva', title: 'Manutenção corretiva', art: 'frame' as const,
    text: 'Diagnóstico e reparo quando o equipamento apresenta falhas, com explicação clara do que foi identificado.',
    benefit: 'Solução objetiva e comunicação transparente em cada etapa.',
    message: 'Olá! Conheci a 2L pelo site e gostaria de solicitar um orçamento para manutenção corretiva do meu ar-condicionado residencial.',
    photo: 'servico-corretiva',
  },
  {
    id: 'instalacao', title: 'Instalação de ar-condicionado', art: 'blocks' as const,
    text: 'Instalação planejada, com atenção ao acabamento e à integração do equipamento com o ambiente.',
    benefit: 'Equipamento instalado de forma discreta, organizada e bem acabada.',
    message: 'Olá! Conheci a 2L pelo site e gostaria de solicitar um orçamento para instalação de ar-condicionado na minha residência.',
    photo: 'servico-instalacao',
  },
]

export const concerns = [
  { problem: 'Falta de pontualidade', answer: 'Horário combinado, comunicado e respeitado.' },
  { problem: 'Profissionais sem apresentação adequada', answer: 'Equipe uniformizada e identificada.' },
  { problem: 'Desorganização no ambiente', answer: 'Área de trabalho protegida e organizada do início ao fim.' },
  { problem: 'Falta de comunicação', answer: 'Contato claro antes, durante e depois do atendimento.' },
  { problem: 'Ausência de cuidado com o espaço', answer: 'Respeito ao patrimônio e à privacidade de quem mora ali.' },
]

/** CONFIRMAR com a empresa: padrões operacionais apresentados como compromissos de atendimento. */
export const commitments = [
  { title: 'Uniforme limpo e identificação', text: 'Profissionais apresentados com uniforme e identificação da 2L.' },
  { title: 'Pontualidade e comunicação', text: 'Confirmação do horário e aviso prévio sobre a chegada da equipe.' },
  { title: 'Respeito à privacidade', text: 'Circulação restrita à área do serviço e discrição durante todo o atendimento.' },
  { title: 'Proteção do ambiente', text: 'Cuidado com móveis, pisos e objetos próximos ao equipamento.' },
  { title: 'Organização durante e após', text: 'Área de trabalho organizada e entregue limpa ao final do serviço.' },
]

export const steps = [
  { title: 'Solicitação pelo WhatsApp', text: 'Você nos conta o que precisa, no seu tempo.' },
  { title: 'Entendimento da necessidade', text: 'Entendemos o equipamento, o ambiente e o que é importante para você.' },
  { title: 'Orçamento personalizado', text: 'Valores apresentados de forma clara, sem tabela genérica.' },
  { title: 'Agendamento', text: 'Data e período combinados, com confirmação por nós.' },
  { title: 'Execução do serviço', text: 'Atendimento realizado com método, organização e discrição.' },
]

/** CONFIRMAR com a empresa quais regiões são efetivamente atendidas antes de publicar. */
export const regions = [
  'Lago Sul', 'Lago Norte', 'Park Way', 'Jardim Botânico', 'Asa Sul', 'Asa Norte', 'Sudoeste', 'Noroeste', 'Águas Claras',
]

export type GalleryItem = { label: string; alt: string; art: 'arch' | 'slats' | 'frame' | 'blocks'; photo?: string }
/**
 * Galeria. Para usar fotos reais: coloque os arquivos em photos-src/, rode `npm run images`
 * e informe aqui o nome do arquivo (ex.: 'galeria-1'), sem extensão. Enquanto não houver foto,
 * aparece uma composição ilustrativa.
 */
export const gallery: GalleryItem[] = [
  { label: 'Residências atendidas', alt: 'Residência atendida pela 2L', art: 'arch' },
  { label: 'Equipamentos', alt: 'Equipamento de ar-condicionado instalado', art: 'slats' },
  { label: 'Profissionais', alt: 'Profissional da 2L em atendimento', art: 'frame' },
  { label: 'Procedimentos', alt: 'Procedimento de higienização', art: 'blocks' },
  { label: 'Resultados reais', alt: 'Resultado de um atendimento', art: 'arch' },
  { label: 'Instalações', alt: 'Instalação concluída', art: 'slats' },
]

export const faqs = [
  { q: 'Quais serviços a 2L oferece?', a: 'Limpeza e higienização, manutenção preventiva, manutenção corretiva e instalação de ar-condicionado.' },
  { q: 'Como funciona o orçamento?', a: 'O orçamento é personalizado. Você nos chama pelo WhatsApp, conta o que precisa e, se possível, envia fotos do equipamento. Com essas informações, apresentamos o valor.' },
  { q: 'A empresa atende residências?', a: 'Sim. Nosso atendimento é voltado a residências em Brasília e no Distrito Federal. Informe sua região para confirmarmos a disponibilidade.' },
  { q: 'Como funciona o agendamento?', a: 'Depois do orçamento, combinamos data e período. O horário só é considerado agendado após a nossa confirmação.' },
  { q: 'Como preparar o ambiente?', a: 'Em geral, basta garantir acesso livre ao equipamento. No agendamento, informamos qualquer orientação específica para o seu caso.' },
  { q: 'Quanto tempo dura o atendimento?', a: 'Depende do serviço e do equipamento. Informamos a estimativa de duração junto com o orçamento.' },
  { q: 'Como funciona a manutenção preventiva?', a: 'São revisões periódicas, definidas conforme o tipo de equipamento e o uso. Registramos cada atendimento e indicamos quando fazer a próxima.' },
]
