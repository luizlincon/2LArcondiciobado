import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { useDB } from '../db/store'
import { RepoError, saveCustomer } from '../db/repo'
import { normalizePhone } from '@/lib/phone'
import { Empty, FormError, FormField, Modal, PageHeader, WhatsAppButton, btnPri, card, fmtPhone } from '../components/ui'

export function CustomerForm({ initial, onDone }: { initial?: import('../types').Customer; onDone: () => void }) {
  const [v, setV] = useState({ name: initial?.name ?? '', phone: initial?.phone ?? '', address: initial?.address ?? '', neighborhood: initial?.neighborhood ?? '', city: initial?.city ?? 'Brasília', notes: initial?.notes ?? '' })
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value })
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const phone = normalizePhone(v.phone)
    if (v.name.trim().length < 3) return setErr('Informe o nome do cliente.')
    if (!phone) return setErr('WhatsApp inválido. Use DDD + número.')
    try { saveCustomer({ ...initial, ...v, name: v.name.trim(), phone, needsReview: false, id: initial?.id }); onDone() }
    catch (x) { setErr(x instanceof RepoError ? x.message : 'Erro ao salvar.') }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <FormField label="Nome"><input className="field" value={v.name} onChange={set('name')} /></FormField>
      <FormField label="WhatsApp"><input className="field" inputMode="tel" value={v.phone} onChange={set('phone')} placeholder="(61) 99999-9999" /></FormField>
      <FormField label="Endereço"><input className="field" value={v.address} onChange={set('address')} /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Bairro"><input className="field" value={v.neighborhood} onChange={set('neighborhood')} /></FormField>
        <FormField label="Cidade"><input className="field" value={v.city} onChange={set('city')} /></FormField>
      </div>
      <FormField label="Observações"><textarea className="field" rows={3} value={v.notes} onChange={set('notes')} /></FormField>
      <FormError msg={err} />
      <button className={btnPri}>Salvar cliente</button>
    </form>
  )
}

export default function Customers() {
  const db = useDB()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const list = useMemo(() => {
    const t = q.trim().toLowerCase(), d = q.replace(/\D/g, '')
    return db.customers.filter((c) => !c.deletedAt && (!t || c.name.toLowerCase().includes(t) || c.neighborhood.toLowerCase().includes(t) || (d && c.phone.includes(d))))
  }, [db.customers, q])
  return (
    <>
      <PageHeader title="Clientes" sub={`${list.length} cadastrados`} actions={<button className={btnPri} onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo cliente</button>} />
      <div className="relative mb-4"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" aria-hidden />
        <input aria-label="Pesquisar clientes" className="field pl-10" placeholder="Pesquisar por nome, bairro ou telefone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {list.length === 0 ? <Empty title={q ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'} text="Clientes são criados automaticamente quando chega uma solicitação pelo site, ou manualmente aqui." /> : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id} className={`${card} flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <Link to={`/admin/clientes/${c.id}`} className="font-display text-lg font-bold text-navy hover:text-electric-600">{c.name}</Link>
                <p className="text-sm text-muted">{fmtPhone(c.phone)} · {[c.neighborhood, c.city].filter(Boolean).join(', ')}</p>
                {c.needsReview && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" /> Mesmo telefone com nome diferente em uma solicitação: revise.</p>}
              </div>
              <WhatsAppButton phone={c.phone} message={`Olá, ${c.name.split(' ')[0]}! Aqui é da 2L Ar Condicionado.`} />
            </li>
          ))}
        </ul>
      )}
      <Modal open={open} title="Novo cliente" onClose={() => setOpen(false)}><CustomerForm onDone={() => setOpen(false)} /></Modal>
    </>
  )
}
