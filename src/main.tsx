import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import RotaProtegida from './components/RotaProtegida.tsx'
import Layout from './components/Layout.tsx'
import Login from './pages/Login.tsx'
import Cardapio from './pages/Cardapio.tsx'
import Estoque from './pages/Estoque.tsx'
import Pedidos from './pages/Pedidos.tsx'
import Financeiro from './pages/Financeiro.tsx'
import Historico from './pages/Historico.tsx'
import Logs from './pages/Logs.tsx'
import Cozinha from './pages/Cozinha.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/cozinha"
            element={
              <RotaProtegida>
                <Cozinha />
              </RotaProtegida>
            }
          />

          <Route
            element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }
          >
            <Route path="/cardapio" element={<Cardapio />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/logs" element={<Logs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)