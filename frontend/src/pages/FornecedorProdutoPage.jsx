import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export function FornecedorProdutoPage() {
  const [relacoes, setRelacoes] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    id_fornecedor: '',
    id_produto: '',
  })

  const fornecedoresMap = useMemo(() => {
    const map = new Map()
    fornecedores.forEach((fornecedor) => {
      map.set(fornecedor.id_fornecedor, fornecedor.nome)
    })
    return map
  }, [fornecedores])

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
      const [relacoesResponse, fornecedoresResponse, produtosResponse] = await Promise.all([
        api.get('/fornecedor-produto/'),
        api.get('/fornecedores/'),
        api.get('/produtos/'),
      ])

      setRelacoes(relacoesResponse.data)
      setFornecedores(fornecedoresResponse.data)
      setProdutos(produtosResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar relacoes fornecedor-produto.')
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

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await api.post('/fornecedor-produto/', {
        id_fornecedor: Number(form.id_fornecedor),
        id_produto: Number(form.id_produto),
      })

      setForm({ id_fornecedor: '', id_produto: '' })
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao criar relacao.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(idFornecedor, idProduto) {
    const confirmed = window.confirm('Deseja realmente excluir esta relacao?')
    if (!confirmed) return

    try {
      await api.delete(`/fornecedor-produto/${idFornecedor}/${idProduto}`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir relacao.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Fornecedor x Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select
          value={form.id_fornecedor}
          onChange={(event) => setForm((prev) => ({ ...prev, id_fornecedor: event.target.value }))}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
        >
          <option value="">Fornecedor</option>
          {fornecedores.map((fornecedor) => (
            <option key={fornecedor.id_fornecedor} value={fornecedor.id_fornecedor}>
              {fornecedor.nome}
            </option>
          ))}
        </select>

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

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
        >
          Vincular
        </button>
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
              <th className="px-3 py-2">Fornecedor</th>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  Carregando...
                </td>
              </tr>
            ) : relacoes.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={3}>
                  Nenhuma relacao encontrada.
                </td>
              </tr>
            ) : (
              relacoes.map((item) => (
                <tr key={`${item.id_fornecedor}-${item.id_produto}`} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    {fornecedoresMap.get(item.id_fornecedor) || `ID ${item.id_fornecedor}`}
                  </td>
                  <td className="px-3 py-2">{produtosMap.get(item.id_produto) || `ID ${item.id_produto}`}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id_fornecedor, item.id_produto)}
                      className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Excluir
                    </button>
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
