/** Conteúdo editável da landing. Nenhum depoimento ou resultado é inventado. */
export type BeforeAfterItem = { before: string; after: string; caption?: string }

/** Cadastre aqui fotos REAIS de atendimentos da 2L (coloque os arquivos em public/antes-depois/). */
export const beforeAfter: BeforeAfterItem[] = []

export const faqs = [
  { q: 'O que é a higienização de ar-condicionado?', a: 'É a limpeza técnica do aparelho, incluindo filtros e demais componentes acessíveis, feita com produtos e procedimentos adequados para cada tipo de equipamento.' },
  { q: 'Com que frequência devo higienizar?', a: 'Depende do tipo de aparelho, do uso e do ambiente. Após o atendimento, a 2L registra uma recomendação de retorno para o seu equipamento e avisa você quando estiver próximo.' },
  { q: 'Como funciona o orçamento?', a: 'O orçamento é personalizado. Você preenche o formulário, envia fotos do aparelho e a 2L analisa e retorna pelo WhatsApp com o valor. Não há cálculo automático de preço.' },
  { q: 'O agendamento é confirmado na hora?', a: 'Não. A data e o período que você escolhe são uma preferência. A 2L entra em contato para confirmar ou propor outro horário.' },
  { q: 'Quais regiões vocês atendem?', a: 'Atendemos Brasília-DF. Informe seu endereço ou região no formulário para confirmarmos a disponibilidade.' },
  { q: 'Preciso enviar fotos?', a: 'Não é obrigatório, mas ajuda bastante. Fotos do aparelho e da etiqueta de identificação permitem um orçamento mais preciso.' },
  { q: 'Vocês fazem manutenção e instalação também?', a: 'Sim. Além da higienização, a 2L faz manutenção preventiva e corretiva, instalação, desinstalação, carga de gás e diagnóstico.' },
]
