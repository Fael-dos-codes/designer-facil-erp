import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

import {
  Users,
  BriefcaseBusiness,
  Wallet,
  Clock,
  UserCheck,
  MessageCircle,
  Activity,
  ShieldCheck
} from 'lucide-react'

export default function VisaoGeral() {

  const [clientes, setClientes] = useState([])
  const [projetos, setProjetos] = useState([])
  const [financeiro, setFinanceiro] = useState([])
  const [membros, setMembros] = useState([])
  const [mensagensEquipe, setMensagensEquipe] = useState([])
  const [mensagensPrivadas, setMensagensPrivadas] = useState([])

  useEffect(() => {
    async function carregarDados() {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('*')

      const { data: projetosData } = await supabase
        .from('projetos')
        .select('*')

      const { data: financeiroData } = await supabase
        .from('financeiro')
        .select('*')

      const { data: membrosData } = await supabase
        .from('equipe_membros')
        .select('*')

      const { data: mensagensEquipeData } = await supabase
        .from('mensagens_equipe')
        .select('*')

      const { data: mensagensPrivadasData } = await supabase
        .from('mensagens_privadas')
        .select('*')

      setClientes(clientesData || [])
      setProjetos(projetosData || [])
      setFinanceiro(financeiroData || [])
      setMembros(membrosData || [])
      setMensagensEquipe(mensagensEquipeData || [])
      setMensagensPrivadas(mensagensPrivadasData || [])
    }

    carregarDados()
  }, [])

  const projetosAtivos = projetos.filter(
    projeto => projeto.status === 'Em andamento'
  ).length

  const totalRecebido = financeiro
    .filter(registro => registro.status === 'Pago')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  const totalPendente = financeiro
    .filter(registro => registro.status === 'Pendente')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  const membrosOnline = membros.filter(
    membro => membro.status_online === true
  ).length

  const totalMensagens =
    mensagensEquipe.length + mensagensPrivadas.length

  return (
    <div>

      <div className="overview-header">
        <h1>Visão Geral</h1>
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
            <UserCheck size={20} />
            Presença da Equipe
          </div>

          <div className="overview-indicator">
            <span>Membros cadastrados</span>
            <strong>{membros.length}</strong>
          </div>

          <div className="overview-indicator">
            <span>Membros online agora</span>
            <strong>{membrosOnline}</strong>
          </div>

          <div className="overview-indicator">
            <span>Membros offline</span>
            <strong>{membros.length - membrosOnline}</strong>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-card-title">
            <MessageCircle size={20} />
            Comunicação Interna
          </div>

          <div className="overview-indicator">
            <span>Mensagens no chat geral</span>
            <strong>{mensagensEquipe.length}</strong>
          </div>

          <div className="overview-indicator">
            <span>Mensagens individuais</span>
            <strong>{mensagensPrivadas.length}</strong>
          </div>

          <div className="overview-indicator">
            <span>Total de interações</span>
            <strong>{totalMensagens}</strong>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-card-title">
            <Activity size={20} />
            Status Operacional
          </div>

          <div className="overview-list-item">
            <strong>Equipe conectada ao sistema</strong>
            <span>
              A aba Equipe permite acompanhar membros online e comunicação interna.
            </span>
          </div>

          <div className="overview-list-item">
            <strong>Comunicação centralizada</strong>
            <span>
              O sistema possui chat geral e conversas individuais entre membros.
            </span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-card-title">
            <ShieldCheck size={20} />
            Controle Interno
          </div>

          <div className="overview-list-item">
            <strong>Ambiente administrativo</strong>
            <span>
              A gestão da equipe fica separada dos clientes, projetos e financeiro.
            </span>
          </div>

          <div className="overview-list-item">
            <strong>Base para permissões futuras</strong>
            <span>
              A estrutura atual permite evoluir para cargos, níveis de acesso e histórico de atividade.
            </span>
          </div>
        </div>

      </div>

    </div>
  )
}