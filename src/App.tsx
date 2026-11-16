import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Privacy from './pages/Privacy'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacidade" element={<Privacy />} />
      <Route path="/admin/*" element={<Suspense fallback={<p className="p-8">Carregando painel...</p>}><AdminApp /></Suspense>} />
      <Route path="*" element={<Landing />} />
    </Routes>
  )
}
