import { Link, useLocation } from 'react-router-dom'

export function NaoAutorizadoPage() {
  const location = useLocation()
  const requiredRoles = location.state?.requiredRoles || []
  const fromPath = location.state?.from?.pathname

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-amber-900">Acesso nao autorizado</h1>
      <p className="mt-2 text-sm text-amber-900">
        Seu perfil nao possui permissao para acessar esta pagina.
      </p>

      {requiredRoles.length > 0 ? (
        <p className="mt-2 text-sm text-amber-800">
          Perfis permitidos: <strong>{requiredRoles.join(', ')}</strong>
        </p>
      ) : null}

      {fromPath ? (
        <p className="mt-2 text-xs text-amber-700">
          Tentativa de acesso: <code>{fromPath}</code>
        </p>
      ) : null}

      <div className="mt-4">
        <Link
          to="/dashboard"
          className="inline-flex rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </section>
  )
}
