import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function ProtectedRoute({ roles = [] }) {
  const { loading, isAuthenticated, user, hasAnyRole } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="p-8 text-center text-slate-600">Carregando sessao...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && user && !hasAnyRole(roles)) {
    return (
      <Navigate
        to="/nao-autorizado"
        state={{ from: location, requiredRoles: roles }}
        replace
      />
    )
  }

  return <Outlet />
}
