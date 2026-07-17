import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api'

export function FuncionariosPage() {
  const { hasAnyRole } = useAuth()
  const canManage = hasAnyRole(['admin'])
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    cargo: '',
  })

  async function loadFuncionarios() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/funcionarios/')
      setFuncionarios(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar funcionarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFuncionarios()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  function resetForm() {
    setEditId(null)
    setForm({ nome: '', cargo: '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canManage) return

    setSaving(true)
    setError('')

    try {
      const payload = {
        nome: form.nome.trim(),
        cargo: form.cargo.trim(),
      }

      if (editId) {
        await api.put(`/funcionarios/${editId}`, payload)
      } else {
        await api.post('/funcionarios/', payload)
      }

      resetForm()
      await loadFuncionarios()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao salvar funcionario.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    if (!canManage) return
    setEditId(item.id_funcionario)
    setForm({
      nome: item.nome,
      cargo: item.cargo,
    })
  }

  async function handleDelete(idFuncionario) {
    if (!canManage) return

    const confirmed = window.confirm('Deseja realmente excluir este funcionario?')
    if (!confirmed) return

    try {
      await api.delete(`/funcionarios/${idFuncionario}`)
      await loadFuncionarios()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir funcionario.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Funcionarios</h1>
        <p className="text-sm text-slate-500">
          Admin gerencia tudo. Gerente possui visualizacao.
        </p>
      </div>

      {canManage ? (
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
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
            value={form.cargo}
            onChange={(event) => setForm((prev) => ({ ...prev, cargo: event.target.value }))}
            placeholder="Cargo"
            minLength={2}
            maxLength={50}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />

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
              <th className="px-3 py-2">Cargo</th>
              {canManage ? <th className="px-3 py-2">Acoes</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={canManage ? 4 : 3}>
                  Carregando...
                </td>
              </tr>
            ) : funcionarios.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={canManage ? 4 : 3}>
                  Nenhum funcionario encontrado.
                </td>
              </tr>
            ) : (
              funcionarios.map((item) => (
                <tr key={item.id_funcionario} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.id_funcionario}</td>
                  <td className="px-3 py-2">{item.nome}</td>
                  <td className="px-3 py-2">{item.cargo}</td>
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
                          onClick={() => handleDelete(item.id_funcionario)}
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
