import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ProdutosPage() {
  const { hasAnyRole } = useAuth()
  const canEdit = hasAnyRole(['admin', 'gerente'])
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    preco: '',
    id_categoria: '',
    exige_preparo: false,
  })

  const categoriasMap = useMemo(() => {
    const map = new Map()
    categorias.forEach((categoria) => {
      map.set(categoria.id_categoria, categoria.descricao)
    })
    return map
  }, [categorias])

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [produtosResponse, categoriasResponse] = await Promise.all([
        api.get('/produtos/'),
        api.get('/categorias/'),
      ])
      setProdutos(produtosResponse.data)
      setCategorias(categoriasResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar produtos.')
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
      const payload = {
        nome: form.nome.trim(),
        preco: Number(form.preco),
        id_categoria: Number(form.id_categoria),
        exige_preparo: form.exige_preparo,
      }

      if (editId) {
        await api.put(`/produtos/${editId}`, payload)
      } else {
        await api.post('/produtos/', payload)
      }

      setEditId(null)
      setForm({ nome: '', preco: '', id_categoria: '', exige_preparo: false })
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao salvar produto.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    setEditId(item.id_produto)
    setForm({
      nome: item.nome,
      preco: String(item.preco),
      id_categoria: String(item.id_categoria),
      exige_preparo: Boolean(item.exige_preparo),
    })
  }

  function cancelEdit() {
    setEditId(null)
    setForm({ nome: '', preco: '', id_categoria: '', exige_preparo: false })
  }

  async function handleDelete(idProduto) {
    const confirmed = window.confirm('Deseja realmente excluir este produto?')
    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/produtos/${idProduto}`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir produto.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Produtos</h1>
        <p className="text-sm text-slate-500">
          {canEdit
            ? 'Seu perfil permite criar, editar e excluir.'
            : 'Seu perfil possui acesso somente de leitura.'}
        </p>
      </div>

      {canEdit ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-3"
        >
          <input
            type="text"
            value={form.nome}
            onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome do produto"
            minLength={2}
            maxLength={100}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2 flex-1 min-w-50"
          />

          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.preco}
            onChange={(event) => setForm((prev) => ({ ...prev, preco: event.target.value }))}
            placeholder="Preco"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2 w-32"
          />

          <select
            value={form.id_categoria}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, id_categoria: event.target.value }))
            }
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2 w-48"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.descricao}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mx-2">
            <input
              type="checkbox"
              checked={form.exige_preparo}
              onChange={(event) => setForm((prev) => ({ ...prev, exige_preparo: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
            />
            Exige Preparo?
          </label>

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
              onClick={cancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Cancelar
            </button>
          ) : null}
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
              <th className="px-3 py-2">Preco</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Preparo?</th>
              {canEdit ? <th className="px-3 py-2">Acoes</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={canEdit ? 6 : 5}>
                  Carregando...
                </td>
              </tr>
            ) : produtos.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={canEdit ? 6 : 5}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtos.map((item) => (
                <tr key={item.id_produto} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.id_produto}</td>
                  <td className="px-3 py-2">{item.nome}</td>
                  <td className="px-3 py-2">{BRL.format(Number(item.preco))}</td>
                  <td className="px-3 py-2">
                    {categoriasMap.get(item.id_categoria) || `ID ${item.id_categoria}`}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold">
                    {item.exige_preparo ? (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md">Sim</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">Não</span>
                    )}
                  </td>
                  {canEdit ? (
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
                          onClick={() => handleDelete(item.id_produto)}
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
