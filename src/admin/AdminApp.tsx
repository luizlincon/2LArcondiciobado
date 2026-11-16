import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { isDemoMode } from '@/lib/config'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import Agenda from './pages/Agenda'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import EquipmentPage from './pages/EquipmentPage'
import Visits from './pages/Visits'
import VisitMap from './pages/VisitMap'
import Maintenance from './pages/Maintenance'
import SettingsPage from './pages/Settings'
import logo from '@/assets/logo-2l.png'

const AUTH = '2l-admin-demo-session'
const getAuth = () => { try { return sessionStorage.getItem(AUTH) === '1' } catch { return false } }

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <img src={logo} alt="2L Ar Condicionado" className="mx-auto h-24 w-auto" />
        <h1 className="mt-4 text-2xl font-extrabold">Área administrativa</h1>
        {isDemoMode() ? (
          <>
            <p className="mt-2 text-sm text-muted">Ambiente de demonstração: sem senha, dados apenas neste navegador. A autenticação real (Supabase Auth, com e-mail e senha do administrador) é ativada ao configurar o backend.</p>
            <button className="btn btn-primary mt-6 w-full" onClick={onLogin}>Entrar no modo demonstração</button>
          </>
        ) : (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Autenticação não configurada. Defina as variáveis do Supabase para habilitar o acesso.</p>
        )}
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [ok, setOk] = useState(getAuth)
  if (!ok) return <Login onLogin={() => { try { sessionStorage.setItem(AUTH, '1') } catch { /* ok */ } setOk(true) }} />
  return (
    <Routes>
      <Route element={<AdminLayout onLogout={() => { try { sessionStorage.removeItem(AUTH) } catch { /* ok */ } setOk(false) }} />}>
        <Route index element={<Dashboard />} />
        <Route path="solicitacoes" element={<Requests />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="clientes/:id" element={<CustomerDetail />} />
        <Route path="equipamentos" element={<EquipmentPage />} />
        <Route path="atendimentos" element={<Visits />} />
        <Route path="mapa" element={<VisitMap />} />
        <Route path="manutencoes" element={<Maintenance />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
