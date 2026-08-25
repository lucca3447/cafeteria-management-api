import { Fragment, useState } from 'react'
import { api } from '../../services/api'
import { BRL } from '../../utils/currency'

export function PedidosList({ pedidos, loading, funcionariosMap, produtosMap, onLoadData, onError }) {
  const [buscaPedido, setBuscaPedido] = useState('')
  const [expandedPedidoId, setExpandedPedidoId] = useState(null)
  const [loadingItensPedidoId, setLoadingItensPedidoId] = useState(null)
  const [itensPorPedido, setItensPorPedido] = useState({})

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const termo = buscaPedido.toLowerCase()
    return String(pedido.id_nota_fiscal).includes(termo)
  })

  async function handleDelete(idNotaFiscal) {
    const confirmed = window.confirm('Deseja realmente excluir este pedido?')
    if (!confirmed) {
      return
    }

    try {
      await api.delete(`/pedidos/${idNotaFiscal}`)
      await onLoadData()
    } catch (requestError) {
      onError(requestError.response?.data?.detail || 'Erro ao excluir pedido.')
    }
  }

  async function handleConcluir(idNotaFiscal) {
    try {
      await api.patch(`/pedidos/${idNotaFiscal}/status`, { status: 'pronto' })
      await onLoadData()
    } catch (requestError) {
      onError(requestError.response?.data?.detail || 'Erro ao concluir pedido.')
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
      onError(requestError.response?.data?.detail || 'Erro ao carregar itens do pedido.')
    } finally {
      setLoadingItensPedidoId(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Histórico de Pedidos</h2>
        <div className="relative w-full max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            value={buscaPedido}
            onChange={(e) => setBuscaPedido(e.target.value)}
            placeholder="Pesquisar pedidos por NF..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm outline-none ring-slate-900 focus:ring-2 transition-shadow"
          />
        </div>
      </div>

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
            ) : pedidosFiltrados.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={5}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <p>Nenhum pedido encontrado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pedidosFiltrados.map((pedido) => {
                const isExpanded = expandedPedidoId === pedido.id_nota_fiscal
                const loadingItens = loadingItensPedidoId === pedido.id_nota_fiscal
                const itens = itensPorPedido[pedido.id_nota_fiscal] || []

                return (
                  <Fragment key={pedido.id_nota_fiscal}>
                    <tr className="border-t border-slate-200">
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

                    {isExpanded && (
                      <tr key={`detalhes-${pedido.id_nota_fiscal}`} className="bg-slate-50">
                        <td colSpan={5} className="px-3 py-3 border-t border-slate-100">
                          {loadingItens ? (
                            <p className="text-slate-500">Carregando itens...</p>
                          ) : itens.length === 0 ? (
                            <p className="text-slate-500">Nenhum item encontrado para este pedido.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                              <table className="min-w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-700">
                                  <tr>
                                    <th className="px-3 py-2">ID Item</th>
                                    <th className="px-3 py-2">Produto</th>
                                    <th className="px-3 py-2">Quantidade</th>
                                    <th className="px-3 py-2">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {itens.map((item) => (
                                    <tr key={item.id_item_pedido} className="border-t border-slate-100">
                                      <td className="px-3 py-2">{item.id_item_pedido}</td>
                                      <td className="px-3 py-2 font-medium text-slate-700">
                                        {produtosMap.get(item.id_produto)?.nome || `ID ${item.id_produto}`}
                                      </td>
                                      <td className="px-3 py-2">{item.quantidade}</td>
                                      <td className="px-3 py-2 font-medium">{BRL.format(Number(item.subtotal))}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
