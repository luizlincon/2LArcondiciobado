import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, CalendarDays, ClipboardList, LogOut, MapPinned, Settings, Users, Wrench, BellRing, AirVent } from 'lucide-react'
import { isDemoMode } from '@/lib/config'
import { loadDemoData } from '../db/demoData'
import { resetDB, useDB } from '../db/store'
import logo from '@/assets/logo-2l.png'

const nav = [
  { to: '/admin', end: true, icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/solicitacoes', icon: ClipboardList, label: 'Solicitações' },
  { to: '/admin/agenda', icon: CalendarDays, label: 'Agenda' },
  { to: '/admin/clientes', icon: Users, label: 'Clientes' },
  { to: '/admin/equipamentos', icon: AirVent, label: 'Equipamentos' },
  { to: '/admin/atendimentos', icon: Wrench, label: 'Atendimentos' },
  { to: '/admin/mapa', icon: MapPinned, label: 'Mapa' },
  { to: '/admin/manutencoes', icon: BellRing, label: 'Manutenções' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const db = useDB()
  const nav2 = useNavigate()
  const empty = db.customers.length === 0 && db.requests.length === 0
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <aside className="bg-navy text-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between px-4 py-3 lg:block">
          <span className="inline-block rounded-lg bg-white p-1.5"><img src={logo} alt="2L" className="h-9 w-auto lg:h-12" /></span>
          <button onClick={() => { onLogout(); nav2('/admin') }} className="rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-label="Sair"><LogOut className="h-5 w-5" /></button>
        </div>
        <nav aria-label="Painel" className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:overflow-visible lg:px-3">
          {nav.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-electric text-white' : 'text-slate-200 hover:bg-white/10'}`}>
              <Icon className="h-4.5 w-4.5" aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { onLogout(); nav2('/admin') }} className="mx-3 mt-4 hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 lg:flex"><LogOut className="h-4 w-4" /> Sair</button>
      </aside>
      <div className="min-w-0 flex-1">
        {isDemoMode() && (
          <div className="flex flex-wrap items-center gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-900">
            <strong>MODO DEMONSTRAÇÃO</strong>
            <span>Os dados ficam só neste navegador. Dados com “(demo)” são fictícios.</span>
            <span className="ml-auto flex gap-2">
              {empty && <button className="rounded bg-amber-900 px-2.5 py-1 font-semibold text-white" onClick={loadDemoData}>Carregar dados de demonstração</button>}
              {!empty && <button className="rounded border border-amber-900 px-2.5 py-1 font-semibold" onClick={() => confirm('Apagar todos os dados de demonstração deste navegador?') && resetDB()}>Limpar tudo</button>}
            </span>
          </div>
        )}
        <main className="mx-auto max-w-6xl p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
