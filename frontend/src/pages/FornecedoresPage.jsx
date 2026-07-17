import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    cnpj: '',
  })

  async function loadFornecedores() {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/fornecedores/')
      setFornecedores(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar fornecedores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFornecedores()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  function resetForm() {
    setEditId(null)
    setForm({ nome: '', telefone: '', cnpj: '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone.trim(),
        cnpj: form.cnpj.trim(),
      }

      if (editId) {
        await api.put(`/fornecedores/${editId}`, payload)
      } else {
        await api.post('/fornecedores/', payload)
      }

      resetForm()
      await loadFornecedores()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao salvar fornecedor.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item) {
    setEditId(item.id_fornecedor)
    setForm({ nome: item.nome, telefone: item.telefone, cnpj: item.cnpj })
  }

  async function handleDelete(idFornecedor) {
    const confirmed = window.confirm('Deseja realmente excluir este fornecedor?')
    if (!confirmed) return

    try {
      await api.delete(`/fornecedores/${idFornecedor}`)
      await loadFornecedores()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir fornecedor.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Fornecedores</h1>
      </div>

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
          value={form.telefone}
          onChange={(event) => setForm((prev) => ({ ...prev, telefone: event.target.value }))}
          placeholder="Telefone"
          minLength={2}
          maxLength={20}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
        />

        <input
          type="text"
          value={form.cnpj}
          onChange={(event) => setForm((prev) => ({ ...prev, cnpj: event.target.value }))}
          placeholder="CNPJ (00.000.000/0000-00)"
          minLength={18}
          maxLength={18}
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
              <th className="px-3 py-2">Telefone</th>
              <th className="px-3 py-2">CNPJ</th>
              <th className="px-3 py-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Carregando...
                </td>
              </tr>
            ) : fornecedores.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            ) : (
              fornecedores.map((item) => (
                <tr key={item.id_fornecedor} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.id_fornecedor}</td>
                  <td className="px-3 py-2">{item.nome}</td>
                  <td className="px-3 py-2">{item.telefone}</td>
                  <td className="px-3 py-2">{item.cnpj}</td>
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
                        onClick={() => handleDelete(item.id_fornecedor)}
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
