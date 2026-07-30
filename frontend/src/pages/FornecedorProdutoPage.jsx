import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

export function FornecedorProdutoPage() {
  const [relacoes, setRelacoes] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
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

  const relacoesFiltradas = relacoes.filter((item) => {
    const termo = busca.toLowerCase()
    const fornecedorNome = fornecedoresMap.get(item.id_fornecedor)?.toLowerCase() || ''
    const produtoNome = produtosMap.get(item.id_produto)?.toLowerCase() || ''
    return fornecedorNome.includes(termo) || produtoNome.includes(termo)
  })

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

      {/* Barra de Pesquisa */}
      <div className="relative max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por fornecedor ou produto..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm outline-none ring-slate-900 focus:ring-2 transition-shadow"
        />
      </div>

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
            ) : relacoesFiltradas.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={3}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <p>Nenhuma relação encontrada.</p>
                  </div>
                </td>
              </tr>
            ) : (
              relacoesFiltradas.map((item) => (
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
