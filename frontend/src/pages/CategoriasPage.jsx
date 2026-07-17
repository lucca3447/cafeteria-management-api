import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api'
import { Edit2, Trash2, Plus, X, Search, Loader2 } from 'lucide-react'

export function CategoriasPage() {
  const { hasAnyRole } = useAuth()
  const canEdit = hasAnyRole(['admin', 'gerente'])
  const [categorias, setCategorias] = useState([])
  const [descricao, setDescricao] = useState('')
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadCategorias() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/categorias/')
      setCategorias(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar categorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategorias()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = { descricao: descricao.trim() }
      if (editId) {
        await api.put(`/categorias/${editId}`, payload)
      } else {
        await api.post('/categorias/', payload)
      }
      setDescricao('')
      setEditId(null)
      await loadCategorias()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao salvar categoria.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    setEditId(item.id_categoria)
    setDescricao(item.descricao)
  }

  function cancelEdit() {
    setEditId(null)
    setDescricao('')
  }

  async function handleDelete(idCategoria) {
    const confirmed = window.confirm('Deseja realmente excluir esta categoria?')
    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/categorias/${idCategoria}`)
      await loadCategorias()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir categoria.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categorias</h1>
          <p className="mt-1 text-slate-500">
            {canEdit
              ? 'Gerencie as categorias dos produtos oferecidos.'
              : 'Seu perfil possui acesso somente de leitura.'}
          </p>
        </div>
      </div>

      {canEdit && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-full sm:flex-1">
              <input
                type="text"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descrição da nova categoria"
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editId ? (
                  'Atualizar'
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </>
                )}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Descrição</th>
                {canEdit && <th className="px-6 py-4 font-semibold text-slate-600 w-24">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 3 : 2} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                      <p>Carregando categorias...</p>
                    </div>
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 3 : 2} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-slate-300" />
                      <p>Nenhuma categoria encontrada.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categorias.map((item) => (
                  <tr key={item.id_categoria} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-500">#{item.id_categoria}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.descricao}</td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id_categoria)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
