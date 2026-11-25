import Art, { type ArtKind } from './Art'

// Fotos reais ficam em public/photos/<nome>.{avif,webp,jpg} (geradas por `npm run images`).
// A busca é feita em tempo de build: sem arquivo, usa a composição ilustrativa (nunca link quebrado).
const byName = (m: Record<string, string>) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [k.split('/').pop()!.replace(/\.[^.]+$/, ''), v]))
const avif = byName(import.meta.glob('/public/photos/*.avif', { eager: true, query: '?url', import: 'default' }))
const webp = byName(import.meta.glob('/public/photos/*.webp', { eager: true, query: '?url', import: 'default' }))
const jpg = byName(import.meta.glob('/public/photos/*.jpg', { eager: true, query: '?url', import: 'default' }))

export const hasPhoto = (name?: string) => !!name && !!(avif[name] || webp[name] || jpg[name])

export default function Photo({ name, alt, art, className = '', eager }: { name?: string; alt: string; art: ArtKind; className?: string; eager?: boolean }) {
  if (name && hasPhoto(name)) {
    return (
      <picture>
        {avif[name] && <source type="image/avif" srcSet={avif[name]} />}
        {webp[name] && <source type="image/webp" srcSet={webp[name]} />}
        <img src={jpg[name] ?? webp[name] ?? avif[name]} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={`h-full w-full object-cover ${className}`} />
      </picture>
    )
  }
  return <Art kind={art} className={`h-full w-full ${className}`} />
}
