import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export function EstoquePage() {
  const [estoque, setEstoque] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    id_produto: '',
    quantidade_estoque: '',
  })

  const produtosMap = useMemo(() => {
    const map = new Map()
    produtos.forEach((produto) => {
      map.set(produto.id_produto, produto.nome)
    })
    return map
  }, [produtos])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [estoqueResponse, produtosResponse] = await Promise.all([
        api.get('/estoque/'),
        api.get('/produtos/'),
      ])
      setEstoque(estoqueResponse.data)
      setProdutos(produtosResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar estoque.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  function resetForm() {
    setEditId(null)
    setForm({ id_produto: '', quantidade_estoque: '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        id_produto: Number(form.id_produto),
        quantidade_estoque: Number(form.quantidade_estoque),
      }

      if (editId) {
        await api.put(`/estoque/${editId}`, payload)
      } else {
        await api.post('/estoque/', payload)
      }

      resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao salvar estoque.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    setEditId(item.id_estoque)
    setForm({
      id_produto: String(item.id_produto),
      quantidade_estoque: String(item.quantidade_estoque),
    })
  }

  async function handleDelete(idEstoque) {
    const confirmed = window.confirm('Deseja realmente excluir este registro de estoque?')
    if (!confirmed) return

    try {
      await api.delete(`/estoque/${idEstoque}`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir estoque.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Estoque</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
        <select
          value={form.id_produto}
          onChange={(event) => setForm((prev) => ({ ...prev, id_produto: event.target.value }))}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
        >
          <option value="">Produto</option>
          {produtos.map((produto) => (
            <option key={produto.id_produto} value={produto.id_produto}>
              {produto.nome}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          step="1"
          value={form.quantidade_estoque}
          onChange={(event) => setForm((prev) => ({ ...prev, quantidade_estoque: event.target.value }))}
          placeholder="Quantidade"
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
        />

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
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2">ID Estoque</th>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Quantidade</th>
              <th className="px-3 py-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            ) : estoque.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Nenhum registro de estoque encontrado.
                </td>
              </tr>
            ) : (
              estoque.map((item) => (
                <tr key={item.id_estoque} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.id_estoque}</td>
                  <td className="px-3 py-2">{produtosMap.get(item.id_produto) || `ID ${item.id_produto}`}</td>
                  <td className="px-3 py-2">{item.quantidade_estoque}</td>
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
                        onClick={() => handleDelete(item.id_estoque)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
