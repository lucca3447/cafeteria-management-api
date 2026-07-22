import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Store, User, KeyRound, Building2, Loader2, ArrowRight } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome_fantasia: '',
    cnpj: '',
    admin: {
      nome: '',
      login: '',
      senha: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/cantinas/registrar', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (requestError) {
      const detail = requestError.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(err => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : 'Erro';
          return `${field}: ${err.msg}`;
        }).join(' | '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Falha ao registrar cantina. Verifique os dados.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <Store className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Cantina Registrada!</h2>
          <p className="mb-8 text-slate-500">Sua conta de administrador foi criada com sucesso. Você será redirecionado para o login em instantes.</p>
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Ir para o Login agora</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden w-1/2 flex-col justify-between bg-linear-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white lg:flex relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex shrink-0 items-center justify-center">
            <img src="/logo.png" alt="FastCantina Logo" className="h-24 w-auto object-contain drop-shadow-lg" />
          </div>
          <span className="text-4xl font-bold tracking-tight font-serif">FastCantina</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-6 font-serif">
            Junte-se à revolução na gestão.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            Cadastre sua cantina hoje e experimente o poder de um ecossistema completo para suas vendas.
          </p>
        </div>

        <div className="relative z-10 text-sm text-brand-200">
          &copy; {new Date().getFullYear()} FastCantina. Todos os direitos reservados.
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-1/2 lg:px-24 xl:px-32 py-12 relative overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Criar Conta</h2>
            <p className="mt-2 text-slate-500">
              Cadastre sua empresa e seu usuário administrador.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Dados da Empresa</h3>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome Fantasia</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Store className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text" required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Nome da sua cantina"
                    value={form.nome_fantasia}
                    onChange={e => setForm(f => ({ ...f, nome_fantasia: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">CNPJ</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text" required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="00.000.000/0001-00"
                    value={form.cnpj}
                    onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Dados do Administrador</h3>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Seu Nome</label>
                <input
                  type="text" required
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Nome completo"
                  value={form.admin.nome}
                  onChange={e => setForm(f => ({ ...f, admin: { ...f.admin, nome: e.target.value } }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Login (Email)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text" required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="seu@email.com"
                    value={form.admin.login}
                    onChange={e => setForm(f => ({ ...f, admin: { ...f.admin, login: e.target.value } }))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password" required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="••••••••"
                    value={form.admin.senha}
                    onChange={e => setForm(f => ({ ...f, admin: { ...f.admin, senha: e.target.value } }))}
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  Registrar Cantina
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
