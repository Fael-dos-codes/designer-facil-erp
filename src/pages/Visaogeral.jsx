import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

import {
  Users,
  BriefcaseBusiness,
  Wallet,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function VisaoGeral() {

  const [clientes, setClientes] = useState([])
  const [projetos, setProjetos] = useState([])
  const [financeiro, setFinanceiro] = useState([])

  useEffect(() => {
    async function carregarDados() {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false })

      const { data: projetosData } = await supabase
        .from('projetos')
        .select('*')
        .order('id', { ascending: false })

      const { data: financeiroData } = await supabase
        .from('financeiro')
        .select('*')
        .order('id', { ascending: false })

      setClientes(clientesData || [])
      setProjetos(projetosData || [])
      setFinanceiro(financeiroData || [])
    }

    carregarDados()
  }, [])

  const projetosAtivos = projetos.filter(projeto => projeto.status === 'Em andamento').length
  const projetosConcluidos = projetos.filter(projeto => projeto.status === 'Concluído').length

  const totalRecebido = financeiro
    .filter(registro => registro.status === 'Pago')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  const totalPendente = financeiro
    .filter(registro => registro.status === 'Pendente')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  return (
    <div>

      <div className="overview-header">
        <div>
          <h1>Visão Geral</h1>
        </div>
      </div>

      <div className="overview-stats">

        <div className="overview-stat">
          <Users />
          <div>
            <span>Clientes cadastrados</span>
            <strong>{clientes.length}</strong>
          </div>
        </div>

        <div className="overview-stat">
          <BriefcaseBusiness />
          <div>
            <span>Projetos em andamento</span>
            <strong>{projetosAtivos}</strong>
          </div>
        </div>

        <div className="overview-stat">
          <Wallet />
          <div>
            <span>Total recebido</span>
            <strong>R$ {totalRecebido.toFixed(2)}</strong>
          </div>
        </div>

        <div className="overview-stat">
          <Clock />
          <div>
            <span>Total pendente</span>
            <strong>R$ {totalPendente.toFixed(2)}</strong>
          </div>
        </div>

      </div>

      <div className="overview-grid">

        <div className="overview-card">
          <div className="overview-card-title">
            <Users size={20} />
            Últimos Clientes
          </div>

          {clientes.slice(0, 5).map(cliente => (
            <div className="overview-list-item" key={cliente.id}>
              <strong>{cliente.nome}</strong>
              <span>Empresa: {cliente.empresa || 'Não informada'}</span>
            </div>
          ))}

          {clientes.length === 0 && (
            <p className="empty-text">Nenhum cliente cadastrado.</p>
          )}
        </div>

        <div className="overview-card">
          <div className="overview-card-title">
            <BriefcaseBusiness size={20} />
            Projetos Recentes
          </div>

          {projetos.slice(0, 5).map(projeto => (
            <div className="overview-list-item" key={projeto.id}>
              <strong>{projeto.servico || 'Projeto sem serviço'}</strong>
              <span>Cliente: {projeto.cliente_nome || projeto.responsavel || 'Não informado'}</span>
              <span>Status: {projeto.status || 'Sem status'}</span>
            </div>
          ))}

          {projetos.length === 0 && (
            <p className="empty-text">Nenhum projeto cadastrado.</p>
          )}
        </div>

        <div className="overview-card">
          <div className="overview-card-title">
            <CheckCircle size={20} />
            Indicadores de Projetos
          </div>

          <div className="overview-indicator">
            <span>Em andamento</span>
            <strong>{projetosAtivos}</strong>
          </div>

          <div className="overview-indicator">
            <span>Concluídos</span>
            <strong>{projetosConcluidos}</strong>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-card-title">
            <AlertTriangle size={20} />
            Financeiro
          </div>

          <div className="overview-indicator">
            <span>Recebido</span>
            <strong>R$ {totalRecebido.toFixed(2)}</strong>
          </div>

          <div className="overview-indicator">
            <span>Pendente</span>
            <strong>R$ {totalPendente.toFixed(2)}</strong>
          </div>
        </div>

      </div>

    </div>
  )
}