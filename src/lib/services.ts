export const SERVICES = [
  { id: 'higienizacao', title: 'Higienização e limpeza', short: 'Limpeza completa do equipamento, com cuidado técnico em cada componente.', featured: true },
  { id: 'manutencao_preventiva', title: 'Manutenção preventiva', short: 'Revisões periódicas para manter o aparelho funcionando bem.' },
  { id: 'manutencao_corretiva', title: 'Manutenção corretiva', short: 'Diagnóstico e reparo quando o aparelho apresenta falhas.' },
  { id: 'instalacao', title: 'Instalação', short: 'Instalação de ar-condicionado com planejamento e acabamento.' },
  { id: 'desinstalacao', title: 'Desinstalação', short: 'Remoção do equipamento com segurança, para mudança ou troca.' },
  { id: 'carga_gas', title: 'Carga de gás e diagnóstico', short: 'Verificação do sistema e reposição de gás quando necessário.' },
] as const

export type ServiceId = (typeof SERVICES)[number]['id']
export const SERVICE_IDS = SERVICES.map((s) => s.id) as [ServiceId, ...ServiceId[]]
export const serviceTitle = (id: string) => SERVICES.find((s) => s.id === id)?.title ?? id
