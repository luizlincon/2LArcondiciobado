// Converte photos-src/* em public/photos/<nome>.{avif,webp,jpg} (máx. 1800px de largura).
import { readdir, mkdir } from 'node:fs/promises'
import { extname, basename } from 'node:path'
import sharp from 'sharp'

const SRC = 'photos-src', OUT = 'public/photos'
await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
if (!files.length) { console.log('Nenhuma imagem em photos-src/.'); process.exit(0) }
for (const f of files) {
  const name = basename(f, extname(f))
  const img = () => sharp(`${SRC}/${f}`).rotate().resize({ width: 1800, withoutEnlargement: true })
  await img().avif({ quality: 55 }).toFile(`${OUT}/${name}.avif`)
  await img().webp({ quality: 78 }).toFile(`${OUT}/${name}.webp`)
  await img().jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/${name}.jpg`)
  console.log('ok', name)
}
