import { useId } from 'react'

export type ArtKind = 'arch' | 'slats' | 'frame' | 'blocks'

/** Equipamento split discreto (forma abstrata, sem ícones genéricos). */
const Unit = ({ x, y, w = 150 }: { x: number; y: number; w?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={38} rx={8} fill="#ece7db" />
    <rect x={x + 10} y={y + 27} width={w - 20} height={2} rx={1} fill="#b99a6b" opacity=".7" />
    <rect x={x} y={y + 38} width={w} height={10} rx={5} fill="#000" opacity=".12" />
  </g>
)

/**
 * Composição editorial ILUSTRATIVA, usada enquanto não há fotografias reais da empresa.
 * Não representa residências, equipamentos ou profissionais reais.
 */
export default function Art({ kind, className = '' }: { kind: ArtKind; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d2b38" /><stop offset="1" stopColor="#0f1923" />
        </linearGradient>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf8f1" /><stop offset="1" stopColor="#e6dfcf" />
        </linearGradient>
      </defs>
      {kind === 'arch' && (
        <g>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          <path d="M105 430V235a95 95 0 0 1 190 0v195Z" fill={`url(#l${id})`} />
          <path d="M200 140v290M105 300h190" stroke="#111b25" strokeOpacity=".25" strokeWidth="2" />
          <polygon points="105,430 295,430 400,500 0,500" fill="#0b131b" opacity=".55" />
          <polygon points="295,330 400,420 400,500 250,500" fill="#b99a6b" opacity=".12" />
          <Unit x={225} y={70} />
        </g>
      )}
      {kind === 'slats' && (
        <g>
          <rect width="400" height="500" fill={`url(#l${id})`} />
          {Array.from({ length: 18 }, (_, i) => (
            <rect key={i} x={50 + i * 17} y={110} width={11} height={340} fill="#b99a6b" opacity={0.35 + (i % 3) * 0.12} />
          ))}
          <rect x="0" y="450" width="400" height="50" fill="#111b25" opacity=".9" />
          <Unit x={125} y={52} />
        </g>
      )}
      {kind === 'frame' && (
        <g>
          <rect width="400" height="500" fill={`url(#g${id})`} />
          {[0, 1, 2].map((i) => <rect key={i} x={55 + i * 98} y={80} width={84} height={340} fill="#f5f2ea" opacity={0.1 + i * 0.07} stroke="#b99a6b" strokeOpacity=".6" strokeWidth="1.5" />)}
          <polygon points="0,500 160,500 400,230 400,150" fill="#fff" opacity=".05" />
          <rect x="0" y="420" width="400" height="80" fill="#0b131b" opacity=".6" />
          <Unit x={60} y={36} w={120} />
        </g>
      )}
      {kind === 'blocks' && (
        <g>
          <rect width="400" height="500" fill={`url(#l${id})`} />
          <rect x="60" y="130" width="170" height="320" fill="#111b25" />
          <rect x="230" y="200" width="120" height="250" fill="#b99a6b" opacity=".75" />
          <rect x="260" y="250" width="60" height="140" fill="#f5f2ea" opacity=".9" />
          <rect x="0" y="450" width="400" height="50" fill="#64717a" opacity=".5" />
          <Unit x={85} y={160} w={120} />
        </g>
      )}
    </svg>
  )
}
