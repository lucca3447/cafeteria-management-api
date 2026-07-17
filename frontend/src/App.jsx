import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { AppLayout } from './components/AppLayout.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { CategoriasPage } from './pages/CategoriasPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { EstoquePage } from './pages/EstoquePage.jsx'
import { FornecedorProdutoPage } from './pages/FornecedorProdutoPage.jsx'
import { FornecedoresPage } from './pages/FornecedoresPage.jsx'
import { FuncionariosPage } from './pages/FuncionariosPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { NaoAutorizadoPage } from './pages/NaoAutorizadoPage.jsx'
import { PedidosPage } from './pages/PedidosPage.jsx'
import { ProdutosPage } from './pages/ProdutosPage.jsx'
import { UsuariosPage } from './pages/UsuariosPage.jsx'
import { CozinhaPage } from './pages/CozinhaPage.jsx'

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <p className="p-8 text-center text-slate-600">Carregando...</p>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <LoginPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/nao-autorizado" element={<NaoAutorizadoPage />} />
          
          {/* Rota da Cozinha (Monitor de Preparo) */}
          <Route path="/cozinha" element={<CozinhaPage />} />

          <Route element={<ProtectedRoute roles={['admin', 'gerente']} />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/funcionarios" element={<FuncionariosPage />} />
            <Route path="/fornecedores" element={<FornecedoresPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/fornecedor-produto" element={<FornecedorProdutoPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
