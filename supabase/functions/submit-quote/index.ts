// Edge Function pública: recebe o formulário de orçamento.
// Roda com service role (a chave nunca vai ao frontend). Valida tudo de novo, aplica rate limit,
// cria/reaproveita cliente pelo telefone normalizado e guarda fotos em bucket privado.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SERVICES = ['higienizacao', 'manutencao_preventiva', 'manutencao_corretiva', 'instalacao', 'desinstalacao', 'carga_gas']
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_BYTES = 8 * 1024 * 1024, MAX_FILES = 6, LIMIT_PER_HOUR = 5
const cors = { 'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (d.length !== 10 && d.length !== 11) return null
  const ddd = Number(d.slice(0, 2)); if (ddd < 11 || ddd > 99) return null
  if (d.length === 11 && d[2] !== '9') return null
  if (d.length === 10 && !/[2-5]/.test(d[2])) return null
  return d
}
async function sha256(s: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('') }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405)
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const ipHash = await sha256(ip + (Deno.env.get('RATE_LIMIT_SALT') ?? ''))
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await db.from('submit_rate_limit').select('*', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since)
  if ((count ?? 0) >= LIMIT_PER_HOUR) return json({ error: 'Muitas tentativas' }, 429)

  let f: FormData
  try { f = await req.formData() } catch { return json({ error: 'Requisição inválida' }, 400) }
  const s = (k: string) => String(f.get(k) ?? '').trim()
  const name = s('name'), phone = normalizePhone(s('whatsapp')), service = s('service'), location = s('location'), notes = s('notes')
  const quantity = Number(s('quantity')), key = s('idempotency_key')
  const date = s('preferred_date'), period = s('preferred_period') || 'indiferente'
  if (name.length < 3 || name.length > 120) return json({ error: 'Nome inválido' }, 400)
  if (!phone) return json({ error: 'WhatsApp inválido' }, 400)
  if (!SERVICES.includes(service)) return json({ error: 'Serviço inválido' }, 400)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return json({ error: 'Quantidade inválida' }, 400)
  if (location.length < 3 || location.length > 250) return json({ error: 'Localização inválida' }, 400)
  if (notes.length > 1000) return json({ error: 'Observações muito longas' }, 400)
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Data inválida' }, 400)
  if (!['manha', 'tarde', 'indiferente'].includes(period)) return json({ error: 'Período inválido' }, 400)
  if (!/^[0-9a-f-]{36}$/i.test(key)) return json({ error: 'Chave inválida' }, 400)
  const photos = f.getAll('photos').filter((x): x is File => x instanceof File)
  if (photos.length > MAX_FILES) return json({ error: 'Máximo de 6 fotos' }, 400)
  for (const p of photos) {
    const ok = TYPES.includes(p.type) || /\.(heic|heif)$/i.test(p.name)
    if (!ok || p.size > MAX_BYTES || p.size === 0) return json({ error: `Foto inválida: ${p.name}` }, 400)
  }

  const dup = await db.from('quote_requests').select('id').eq('idempotency_key', key).maybeSingle()
  if (dup.data) return json({ id: dup.data.id }) // reenvio do mesmo formulário: não duplica
  await db.from('submit_rate_limit').insert({ ip_hash: ipHash })

  let { data: cust } = await db.from('customers').select('id,name,needs_review').eq('phone', phone).is('deleted_at', null).maybeSingle()
  if (!cust) {
    const ins = await db.from('customers').insert({ name, phone, address: location }).select('id,name,needs_review').single()
    if (ins.error) return json({ error: 'Não foi possível registrar' }, 500)
    cust = ins.data
  } else if (cust.name.trim().toLowerCase() !== name.toLowerCase() && !cust.needs_review) {
    await db.from('customers').update({ needs_review: true }).eq('id', cust.id) // conflito para revisão administrativa
  }
  const extra = cust.name.trim().toLowerCase() !== name.toLowerCase() ? `${notes}${notes ? '\n' : ''}[Nome informado no formulário: ${name}]` : notes
  const reqIns = await db.from('quote_requests').insert({
    idempotency_key: key, customer_id: cust.id, service_id: service, quantity, location, notes: extra,
    preferred_date: date || null, preferred_period: period,
  }).select('id').single()
  if (reqIns.error) return json({ error: 'Não foi possível registrar' }, 500)

  for (const p of photos) {
    const ext = (p.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)
    const path = `${reqIns.data.id}/${crypto.randomUUID()}.${ext}`
    const up = await db.storage.from('request-photos').upload(path, p, { contentType: p.type || 'image/heic' })
    if (!up.error) await db.from('quote_request_photos').insert({ request_id: reqIns.data.id, storage_path: path, content_type: p.type || 'image/heic', size_bytes: p.size })
  }
  return json({ id: reqIns.data.id }, 201)
})
