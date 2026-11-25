/** Logotipo tipográfico (wordmark). A logo com floco de neve e azul elétrico não é usada nesta direção. */
export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2.5" aria-label="2L Ar Condicionado">
      <span className={`font-display text-2xl font-semibold tracking-tight ${light ? 'text-paper' : 'text-ink'}`}>2L</span>
      <span className="h-3 w-px bg-champagne" aria-hidden />
      <span className={`text-[0.62rem] font-medium uppercase tracking-[0.3em] ${light ? 'text-paper/80' : 'text-slate2'}`}>Ar Condicionado</span>
    </span>
  )
}
