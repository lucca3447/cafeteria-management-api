import { useState, useMemo } from 'react'
import { api } from '../../services/api'
import { BRL } from '../../utils/currency'

export function PedidoForm({ funcionarios, produtos, produtosMap, opcoesProdutosMap, onPedidoCriado, onError }) {
  const [saving, setSaving] = useState(false)
  const [idFuncionario, setIdFuncionario] = useState('')
  const [itemForm, setItemForm] = useState({
    id_produto: '',
    quantidade: '1',
  })
  const [itensRascunho, setItensRascunho] = useState([])
  const [buscaProduto, setBuscaProduto] = useState('')

  const totalPedido = useMemo(() => {
    const total = itensRascunho.reduce((acc, item) => acc + Number(item.subtotal), 0)
    return Number(total.toFixed(2))
  }, [itensRascunho])

  function handleProdutoChange(event) {
    const val = event.target.value
    setBuscaProduto(val)
    
    const id = opcoesProdutosMap.get(val)
    if (id) {
      setItemForm((prev) => ({ ...prev, id_produto: id }))
    } else {
      setItemForm((prev) => ({ ...prev, id_produto: '' }))
    }
  }

  function adicionarItemRascunho(event) {
    event.preventDefault()

    const idProduto = Number(itemForm.id_produto)
    const quantidade = Number(itemForm.quantidade)

    const produto = produtosMap.get(idProduto)
    if (!produto) {
      onError('Selecione um produto valido.')
      return
    }

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      onError('Quantidade deve ser maior que zero.')
      return
    }

    const precoUnitario = Number(produto.preco)
    const subtotal = Number((precoUnitario * quantidade).toFixed(2))

    setItensRascunho((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${Math.random()}`,
        id_produto: idProduto,
        nome_produto: produto.nome,
        quantidade,
        subtotal,
      },
    ])

    setItemForm({ id_produto: '', quantidade: '1' })
    setBuscaProduto('')
    onError('')
  }

  function removerItemRascunho(uid) {
    setItensRascunho((prev) => prev.filter((item) => item.uid !== uid))
  }

  function limparFormularioPedido() {
    setIdFuncionario('')
    setItemForm({ id_produto: '', quantidade: '1' })
    setItensRascunho([])
    setBuscaProduto('')
  }

  async function criarPedidoCompleto(event) {
    event.preventDefault()
    setSaving(true)
    onError('')

    if (!idFuncionario && idFuncionario !== '0') {
      onError('Informe o funcionario do pedido.')
      setSaving(false)
      return
    }

    if (itensRascunho.length === 0) {
      onError('Adicione pelo menos 1 item ao pedido.')
      setSaving(false)
      return
    }

    try {
      await api.post('/pedidos/completo', {
        id_funcionario: Number(idFuncionario),
        itens: itensRascunho.map((item) => ({
          id_produto: item.id_produto,
          quantidade: item.quantidade,
        })),
      })

      limparFormularioPedido()
      await onPedidoCriado()
    } catch (requestError) {
      onError(requestError.response?.data?.detail || 'Erro ao criar pedido.')
    } finally {
      setSaving(false)
    }
  }

  const funcionariosDisponiveis = funcionarios.length > 0

  return (
    <form onSubmit={criarPedidoCompleto} className="space-y-4 rounded-xl border border-slate-200 p-4">
      <h2 className="text-lg font-semibold">Novo Pedido Completo</h2>

      <div className="grid gap-3 md:grid-cols-[260px_1fr]">
        {funcionariosDisponiveis ? (
          <select
            value={idFuncionario}
            onChange={(event) => setIdFuncionario(event.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          >
            <option value="">Funcionario</option>
            {funcionarios.map((funcionario) => (
              <option key={funcionario.id_funcionario} value={funcionario.id_funcionario}>
                {funcionario.nome} (ID {funcionario.id_funcionario})
              </option>
            ))}
          </select>
        ) : (
          <input
            type="number"
            min="0"
            value={idFuncionario}
            onChange={(event) => setIdFuncionario(event.target.value)}
            placeholder="ID do funcionario"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Valor total calculado</p>
          <p className="text-lg font-semibold">{BRL.format(totalPedido)}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_120px_auto] items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Buscar Produto</label>
          <input
            type="text"
            list="produtos-list"
            value={buscaProduto}
            onChange={handleProdutoChange}
            placeholder="Digite o nome do produto..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />
          <datalist id="produtos-list">
            {produtos.map((produto) => {
              const label = `${produto.nome} - ${BRL.format(Number(produto.preco))}`
              return <option key={produto.id_produto} value={label} />
            })}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Quantidade</label>
          <input
            type="number"
            min="1"
            step="1"
            value={itemForm.quantidade}
            onChange={(event) => setItemForm((prev) => ({ ...prev, quantidade: event.target.value }))}
            placeholder="Qtd"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />
        </div>

        <button
          type="button"
          onClick={adicionarItemRascunho}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 h-[42px]"
        >
          Adicionar Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Quantidade</th>
              <th className="px-3 py-2">Subtotal</th>
              <th className="px-3 py-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {itensRascunho.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={4}>
                  Nenhum item adicionado.
                </td>
              </tr>
            ) : (
              itensRascunho.map((item) => (
                <tr key={item.uid} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.nome_produto}</td>
                  <td className="px-3 py-2">{item.quantidade}</td>
                  <td className="px-3 py-2">{BRL.format(Number(item.subtotal))}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removerItemRascunho(item.uid)}
                      className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
        >
          {saving ? 'Salvando...' : 'Criar Pedido Completo'}
        </button>

        <button
          type="button"
          onClick={limparFormularioPedido}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Limpar
        </button>
      </div>
    </form>
  )
}
