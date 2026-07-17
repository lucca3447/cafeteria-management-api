import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedPedidoId, setExpandedPedidoId] = useState(null)
  const [loadingItensPedidoId, setLoadingItensPedidoId] = useState(null)
  const [itensPorPedido, setItensPorPedido] = useState({})

  const [idFuncionario, setIdFuncionario] = useState('')
  const [itemForm, setItemForm] = useState({
    id_produto: '',
    quantidade: '1',
  })
  const [itensRascunho, setItensRascunho] = useState([])

  const produtosMap = useMemo(() => {
    const map = new Map()
    produtos.forEach((produto) => {
      map.set(produto.id_produto, produto)
    })
    return map
  }, [produtos])

  const funcionariosMap = useMemo(() => {
    const map = new Map()
    funcionarios.forEach((funcionario) => {
      map.set(funcionario.id_funcionario, funcionario.nome)
    })
    return map
  }, [funcionarios])

  const totalPedido = useMemo(() => {
    const total = itensRascunho.reduce((acc, item) => acc + Number(item.subtotal), 0)
    return Number(total.toFixed(2))
  }, [itensRascunho])

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [pedidosResponse, produtosResponse] = await Promise.all([
        api.get('/pedidos/'),
        api.get('/produtos/'),
      ])

      setPedidos(pedidosResponse.data)
      setProdutos(produtosResponse.data)

      try {
        const funcionariosResponse = await api.get('/funcionarios/')
        setFuncionarios(funcionariosResponse.data)
      } catch {
        setFuncionarios([])
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar pedidos.')
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

  function adicionarItemRascunho(event) {
    event.preventDefault()

    const idProduto = Number(itemForm.id_produto)
    const quantidade = Number(itemForm.quantidade)

    const produto = produtosMap.get(idProduto)
    if (!produto) {
      setError('Selecione um produto valido.')
      return
    }

    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setError('Quantidade deve ser maior que zero.')
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
    setError('')
  }

  function removerItemRascunho(uid) {
    setItensRascunho((prev) => prev.filter((item) => item.uid !== uid))
  }

  function limparFormularioPedido() {
    setIdFuncionario('')
    setItemForm({ id_produto: '', quantidade: '1' })
    setItensRascunho([])
  }

  async function criarPedidoCompleto(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    if (!idFuncionario && idFuncionario !== '0') {
      setError('Informe o funcionario do pedido.')
      setSaving(false)
      return
    }

    if (itensRascunho.length === 0) {
      setError('Adicione pelo menos 1 item ao pedido.')
      setSaving(false)
      return
    }

    let pedidoCriado = null

    try {
      const payloadPedido = {
        id_funcionario: Number(idFuncionario),
        valor_total: totalPedido,
      }

      const pedidoResponse = await api.post('/pedidos/', payloadPedido)
      pedidoCriado = pedidoResponse.data

      const idNotaFiscal = pedidoCriado.id_nota_fiscal

      await Promise.all(
        itensRascunho.map((item) =>
          api.post('/itens-pedido/', {
            quantidade: Number(item.quantidade),
            subtotal: Number(item.subtotal),
            id_produto: Number(item.id_produto),
            id_nota_fiscal: Number(idNotaFiscal),
          }),
        ),
      )

      // Se nenhum item exige preparo, já marcamos o pedido como pronto/concluído
      const precisaPreparo = itensRascunho.some(item => {
        const produto = produtosMap.get(item.id_produto)
        return produto?.exige_preparo === true
      })

      if (!precisaPreparo) {
        try {
          await api.patch(`/pedidos/${idNotaFiscal}/status`, { status: 'pronto' })
        } catch (e) {
          // Ignorar falha no patch de status
        }
      }

      limparFormularioPedido()
      await loadData()
    } catch (requestError) {
      if (pedidoCriado?.id_nota_fiscal) {
        try {
          await api.delete(`/pedidos/${pedidoCriado.id_nota_fiscal}`)
        } catch {
          // Ignora erro de rollback e mantém o erro original para o usuário.
        }
      }

      setError(requestError.response?.data?.detail || 'Erro ao criar pedido completo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(idNotaFiscal) {
    const confirmed = window.confirm('Deseja realmente excluir este pedido?')
    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/pedidos/${idNotaFiscal}`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao excluir pedido.')
    }
  }

  async function handleConcluir(idNotaFiscal) {
    try {
      await api.patch(`/pedidos/${idNotaFiscal}/status`, { status: 'pronto' })
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao concluir pedido.')
    }
  }

  async function fetchItensPedido(idNotaFiscal) {
    try {
      const response = await api.get(`/pedidos/${idNotaFiscal}/itens`)
      return response.data
    } catch {
      const response = await api.get('/itens-pedido/')
      return response.data.filter((item) => item.id_nota_fiscal === idNotaFiscal)
    }
  }

  async function toggleDetalhesPedido(idNotaFiscal) {
    if (expandedPedidoId === idNotaFiscal) {
      setExpandedPedidoId(null)
      return
    }

    setExpandedPedidoId(idNotaFiscal)

    if (itensPorPedido[idNotaFiscal]) {
      return
    }

    setLoadingItensPedidoId(idNotaFiscal)
    try {
      const itens = await fetchItensPedido(idNotaFiscal)
      setItensPorPedido((prev) => ({ ...prev, [idNotaFiscal]: itens }))
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Erro ao carregar itens do pedido.')
    } finally {
      setLoadingItensPedidoId(null)
    }
  }

  const funcionariosDisponiveis = funcionarios.length > 0

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-slate-500">
          A criacao do pedido e feita em uma unica tela, com os itens vinculados ao pedido.
        </p>
      </div>

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

        <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
          <select
            value={itemForm.id_produto}
            onChange={(event) => setItemForm((prev) => ({ ...prev, id_produto: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          >
            <option value="">Produto</option>
            {produtos.map((produto) => (
              <option key={produto.id_produto} value={produto.id_produto}>
                {produto.nome} - {BRL.format(Number(produto.preco))}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            step="1"
            value={itemForm.quantidade}
            onChange={(event) => setItemForm((prev) => ({ ...prev, quantidade: event.target.value }))}
            placeholder="Quantidade"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-900 focus:ring-2"
          />

          <button
            type="button"
            onClick={adicionarItemRascunho}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
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

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2">NF</th>
              <th className="px-3 py-2">Funcionario</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Data/Hora</th>
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
            ) : pedidos.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => {
                const isExpanded = expandedPedidoId === pedido.id_nota_fiscal
                const loadingItens = loadingItensPedidoId === pedido.id_nota_fiscal
                const itens = itensPorPedido[pedido.id_nota_fiscal] || []

                return (
                  <>
                    <tr key={`pedido-${pedido.id_nota_fiscal}`} className="border-t border-slate-200">
                      <td className="px-3 py-2">{pedido.id_nota_fiscal}</td>
                      <td className="px-3 py-2">
                        {funcionariosMap.get(pedido.id_funcionario) || `ID ${pedido.id_funcionario}`}
                      </td>
                      <td className="px-3 py-2">{BRL.format(Number(pedido.valor_total))}</td>
                      <td className="px-3 py-2">{new Date(pedido.data_hora).toLocaleString('pt-BR')}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleDetalhesPedido(pedido.id_nota_fiscal)}
                            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-100"
                          >
                            {isExpanded ? 'Ocultar itens' : 'Ver itens'}
                          </button>
                          {pedido.status === 'pendente' && (
                            <button
                              type="button"
                              onClick={() => handleConcluir(pedido.id_nota_fiscal)}
                              className="rounded-md border border-emerald-300 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                            >
                              Concluir
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(pedido.id_nota_fiscal)}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr key={`detalhes-${pedido.id_nota_fiscal}`} className="border-t border-slate-100 bg-slate-50">
                        <td colSpan={5} className="px-3 py-3">
                          {loadingItens ? (
                            <p className="text-slate-500">Carregando itens...</p>
                          ) : itens.length === 0 ? (
                            <p className="text-slate-500">Nenhum item encontrado para este pedido.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                              <table className="min-w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-700">
                                  <tr>
                                    <th className="px-2 py-2">ID Item</th>
                                    <th className="px-2 py-2">Produto</th>
                                    <th className="px-2 py-2">Quantidade</th>
                                    <th className="px-2 py-2">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {itens.map((item) => (
                                    <tr key={item.id_item_pedido} className="border-t border-slate-100">
                                      <td className="px-2 py-2">{item.id_item_pedido}</td>
                                      <td className="px-2 py-2">
                                        {produtosMap.get(item.id_produto)?.nome || `ID ${item.id_produto}`}
                                      </td>
                                      <td className="px-2 py-2">{item.quantidade}</td>
                                      <td className="px-2 py-2">{BRL.format(Number(item.subtotal))}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
