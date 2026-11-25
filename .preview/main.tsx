import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../src/pages/Landing'
import '../src/index.css'
createRoot(document.getElementById('root')!).render(<MemoryRouter><Landing /></MemoryRouter>)
