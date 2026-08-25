import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { AppLayout } from './components/AppLayout.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'

// Lazy loading das páginas para Code Splitting
const CategoriasPage = lazy(() => import('./pages/CategoriasPage.jsx').then(m => ({ default: m.CategoriasPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx').then(m => ({ default: m.DashboardPage })))
const EstoquePage = lazy(() => import('./pages/EstoquePage.jsx').then(m => ({ default: m.EstoquePage })))
const FornecedorProdutoPage = lazy(() => import('./pages/FornecedorProdutoPage.jsx').then(m => ({ default: m.FornecedorProdutoPage })))
const FornecedoresPage = lazy(() => import('./pages/FornecedoresPage.jsx').then(m => ({ default: m.FornecedoresPage })))
const FuncionariosPage = lazy(() => import('./pages/FuncionariosPage.jsx').then(m => ({ default: m.FuncionariosPage })))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx').then(m => ({ default: m.RegisterPage })))
const NaoAutorizadoPage = lazy(() => import('./pages/NaoAutorizadoPage.jsx').then(m => ({ default: m.NaoAutorizadoPage })))
const PedidosPage = lazy(() => import('./pages/PedidosPage.jsx').then(m => ({ default: m.PedidosPage })))
const ProdutosPage = lazy(() => import('./pages/ProdutosPage.jsx').then(m => ({ default: m.ProdutosPage })))
const UsuariosPage = lazy(() => import('./pages/UsuariosPage.jsx').then(m => ({ default: m.UsuariosPage })))
const CozinhaPage = lazy(() => import('./pages/CozinhaPage.jsx').then(m => ({ default: m.CozinhaPage })))

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

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-brand-50">
      <div className="text-brand-900 flex flex-col items-center gap-3">
        <svg className="h-8 w-8 animate-spin text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium">Carregando módulo...</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/registrar" element={<RegisterPage />} />

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
    </Suspense>
  )
}
