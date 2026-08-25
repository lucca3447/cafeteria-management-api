import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { BRL } from '../utils/currency'
import { PedidoForm } from '../components/pedidos/PedidoForm'
import { PedidosList } from '../components/pedidos/PedidosList'

export function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const opcoesProdutosMap = useMemo(() => {
    const map = new Map()
    produtos.forEach((produto) => {
      const label = `${produto.nome} - ${BRL.format(Number(produto.preco))}`
      map.set(label, produto.id_produto)
    })
    return map
  }, [produtos])

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
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-slate-500">
          A criacao do pedido e feita em uma unica tela, com os itens vinculados ao pedido.
        </p>
      </div>

      <PedidoForm
        funcionarios={funcionarios}
        produtos={produtos}
        produtosMap={produtosMap}
        opcoesProdutosMap={opcoesProdutosMap}
        onPedidoCriado={loadData}
        onError={setError}
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <PedidosList
        pedidos={pedidos}
        loading={loading}
        funcionariosMap={funcionariosMap}
        produtosMap={produtosMap}
        onLoadData={loadData}
        onError={setError}
      />
    </section>
  )
}
