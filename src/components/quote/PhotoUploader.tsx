import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { PHOTO_MAX_COUNT, validatePhoto } from '@/lib/quoteSchema'

type Props = { files: File[]; onChange: (files: File[]) => void; disabled?: boolean }

export default function PhotoUploader({ files, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const next = files.map((f) => (/heic|heif/i.test(f.type + f.name) ? '' : URL.createObjectURL(f)))
    setUrls(next)
    return () => next.forEach((u) => u && URL.revokeObjectURL(u))
  }, [files])

  function add(list: FileList | null) {
    if (!list) return
    const errs: string[] = []
    const accepted: File[] = []
    for (const f of Array.from(list)) {
      const err = validatePhoto(f)
      if (err) errs.push(err)
      else if (files.length + accepted.length >= PHOTO_MAX_COUNT) {
        errs.push(`Limite de ${PHOTO_MAX_COUNT} fotos atingido.`)
        break
      } else accepted.push(f)
    }
    setErrors(errs)
    if (accepted.length) onChange([...files, ...accepted])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        id="photos"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(e) => add(e.target.files)}
      />
      <label
        htmlFor="photos"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-mist px-4 py-6 text-center text-sm text-muted transition-colors hover:border-electric"
      >
        <ImagePlus className="h-7 w-7 text-electric" aria-hidden />
        <span className="font-semibold text-navy">Adicionar fotos do aparelho</span>
        <span>JPG, PNG, WEBP ou HEIC. Até {PHOTO_MAX_COUNT} fotos de 8 MB cada.</span>
      </label>
      {errors.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 text-sm text-red-700">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-silver">
              {urls[i] ? (
                <img src={urls[i]} alt={`Pré-visualização de ${f.name}`} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center p-1 text-center text-xs text-muted">{f.name}</span>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded-full bg-navy/85 p-1 text-white hover:bg-navy"
                aria-label={`Remover ${f.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
