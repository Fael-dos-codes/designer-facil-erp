import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function Dashboard() {

  const [totalClientes, setTotalClientes] = useState(0)
  const [projetosAtivos, setProjetosAtivos] = useState(0)
  const [totalRecebido, setTotalRecebido] = useState(0)
  const [totalPendente, setTotalPendente] = useState(0)

  const [ultimosClientes, setUltimosClientes] = useState([])
  const [ultimosProjetos, setUltimosProjetos] = useState([])

  useEffect(() => {

    async function carregarDashboard() {

      const { count } = await supabase
        .from('clientes')
        .select('*', {
          count: 'exact',
          head: true
        })

      setTotalClientes(count || 0)

      const { data: clientesRecentes } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false })
        .limit(5)

      setUltimosClientes(clientesRecentes || [])

      const { data: projetos } = await supabase
        .from('projetos')
        .select('*')

      if (projetos) {
        const ativos = projetos.filter(
          projeto => projeto.status === 'Em andamento'
        )

        setProjetosAtivos(ativos.length)
      }

      const { data: projetosRecentes } = await supabase
        .from('projetos')
        .select(`
          *,
          clientes (
            nome
          )
        `)
        .order('id', { ascending: false })
        .limit(5)

      setUltimosProjetos(projetosRecentes || [])

      const { data: financeiro } = await supabase
        .from('financeiro')
        .select('*')

      if (financeiro) {

        const recebido = financeiro
          .filter(registro => registro.status === 'Pago')
          .reduce((soma, registro) => {
            return soma + Number(registro.valor || 0)
          }, 0)

        const pendente = financeiro
          .filter(registro => registro.status === 'Pendente')
          .reduce((soma, registro) => {
            return soma + Number(registro.valor || 0)
          }, 0)

        setTotalRecebido(recebido)
        setTotalPendente(pendente)
      }
    }

    carregarDashboard()

  }, [])

  return (
    <div>

      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-value">
            {totalClientes}
          </div>
          <div className="stat-title">
            Total de Clientes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            {projetosAtivos}
          </div>
          <div className="stat-title">
            Projetos Ativos
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            R$ {totalRecebido.toFixed(2)}
          </div>
          <div className="stat-title">
            Total Recebido
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            R$ {totalPendente.toFixed(2)}
          </div>
          <div className="stat-title">
            Total Pendente
          </div>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Últimos Clientes</h3>

          <div className="dashboard-list">

            {ultimosClientes.length === 0 ? (
              <div className="dashboard-item dashboard-empty">
                Nenhum cliente cadastrado.
              </div>
            ) : (
              ultimosClientes.map(cliente => (
                <div
                  className="dashboard-item dashboard-item-clean"
                  key={cliente.id}
                >
                  <strong>
                    {cliente.nome || 'Cliente sem nome'}
                  </strong>

                  <span>
                    Empresa: {cliente.empresa || 'Não informada'}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>

        <div className="dashboard-card">
          <h3>Últimos Projetos</h3>

          <div className="dashboard-list">

            {ultimosProjetos.length === 0 ? (
              <div className="dashboard-item dashboard-empty">
                Nenhum projeto cadastrado.
              </div>
            ) : (
              ultimosProjetos.map(projeto => (
                <div
                  className="dashboard-item dashboard-item-clean"
                  key={projeto.id}
                >
                  <strong>
                    {projeto.servico || 'Projeto sem serviço'}
                  </strong>

                  <span>
                    Cliente: {projeto.clientes?.nome || 'Não encontrado'}
                  </span>

                  <span>
                    Status: {projeto.status || 'Sem status'}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>

      </div>

    </div>
  )
}