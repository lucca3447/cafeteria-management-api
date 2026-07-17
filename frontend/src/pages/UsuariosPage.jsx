import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api'

const PERFIS = ['admin', 'gerente', 'funcionario']

export function UsuariosPage() {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['admin'])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    login: '',
    senha: '',
    perfil: 'funcionario',
    ativo: true,
  })

  async function loadUsuarios() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/usuarios/')
      setUsuarios(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsuarios()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  function resetForm() {
    setEditId(null)
    setForm({
      nome: '',
      login: '',
      senha: '',
      perfil: 'funcionario',
      ativo: true,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canManage) return

    setSaving(true)
    setError('')

    try {
      if (editId) {
        const payload = {
          nome: form.nome.trim(),
          login: form.login.trim(),
          perfil: form.perfil,
          ativo: form.ativo,
        }

        if (form.senha.trim()) {
          payload.senha = form.senha
        }

        await api.put(`/usuarios/${editId}`, payload)
      } else {
        await api.post('/usuarios/', {
          nome: form.nome.trim(),
          login: form.login.trim(),
          senha: form.senha,
          perfil: form.perfil,
          ativo: form.ativo,
        })
      }

      resetForm()
      await loadUsuarios()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao salvar usuario.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    if (!canManage) return
    setEditId(item.id_usuario)
    setForm({
      nome: item.nome,
      login: item.login,
      senha: '',
      perfil: item.perfil,
      ativo: item.ativo,
    })
  }

  async function handleDelete(idUsuario) {
    if (!canManage) return

    const confirmed = window.confirm('Deseja realmente excluir este usuario?')
    if (!confirmed) return

    try {
      await api.delete(`/usuarios/${idUsuario}`)
      await loadUsuarios()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir usuario.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-slate-500">
          Admin gerencia tudo. Gerente possui visualizacao.
        </p>
      </div>

      {canManage ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-2"
        >
          <input
            type="text"
            value={form.nome}
            onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome"
            minLength={2}
            maxLength={100}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />

          <input
            type="text"
            value={form.login}
            onChange={(event) => setForm((prev) => ({ ...prev, login: event.target.value }))}
            placeholder="Login"
            minLength={3}
            maxLength={50}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />

          <input
            type="password"
            value={form.senha}
            onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
            placeholder={editId ? 'Senha (opcional na edicao)' : 'Senha'}
            minLength={8}
            maxLength={100}
            required={!editId}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />

          <select
            value={form.perfil}
            onChange={(event) => setForm((prev) => ({ ...prev, perfil: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          >
            {PERFIS.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfil}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(event) => setForm((prev) => ({ ...prev, ativo: event.target.checked }))}
            />
            Usuario ativo
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
            >
              {editId ? 'Atualizar' : 'Criar'}
            </button>
            {editId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Login</th>
              <th className="px-3 py-2">Perfil</th>
              <th className="px-3 py-2">Ativo</th>
              {canManage ? <th className="px-3 py-2">Acoes</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={canManage ? 6 : 5}>
                  Carregando...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={canManage ? 6 : 5}>
                  Nenhum usuario encontrado.
                </td>
              </tr>
            ) : (
              usuarios.map((item) => (
                <tr key={item.id_usuario} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.id_usuario}</td>
                  <td className="px-3 py-2">{item.nome}</td>
                  <td className="px-3 py-2">{item.login}</td>
                  <td className="px-3 py-2">{item.perfil}</td>
                  <td className="px-3 py-2">{item.ativo ? 'Sim' : 'Nao'}</td>
                  {canManage ? (
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id_usuario)}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
