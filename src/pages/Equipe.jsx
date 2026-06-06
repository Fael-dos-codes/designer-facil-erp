import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Users, Send, Circle, MessageCircle } from 'lucide-react'

export default function Equipe() {

  const [membroAtual, setMembroAtual] = useState(null)

  const [membros, setMembros] = useState([])
  const [mensagensEquipe, setMensagensEquipe] = useState([])
  const [mensagensPrivadas, setMensagensPrivadas] = useState([])

  const [mensagemEquipe, setMensagemEquipe] = useState('')
  const [mensagemPrivada, setMensagemPrivada] = useState('')

  const [membroSelecionado, setMembroSelecionado] = useState(null)

  const carregarMembros = useCallback(async () => {
    const { data } = await supabase
      .from('equipe_membros')
      .select('*')
      .order('status_online', { ascending: false })
      .order('nome')

    setMembros(data || [])
  }, [])

  const carregarMensagensEquipe = useCallback(async () => {
    const { data } = await supabase
      .from('mensagens_equipe')
      .select(`
        *,
        equipe_membros (
          nome,
          email
        )
      `)
      .order('id', { ascending: true })
      .limit(80)

    setMensagensEquipe(data || [])
  }, [])

  const carregarMensagensPrivadas = useCallback(async (destinatario, membroBase) => {
    const remetente = membroBase || membroAtual
    const destino = destinatario || membroSelecionado

    if (!remetente || !destino) return

    const { data } = await supabase
      .from('mensagens_privadas')
      .select('*')
      .or(
        `and(remetente_id.eq.${remetente.id},destinatario_id.eq.${destino.id}),and(remetente_id.eq.${destino.id},destinatario_id.eq.${remetente.id})`
      )
      .order('id', { ascending: true })
      .limit(80)

    setMensagensPrivadas(data || [])
  }, [membroAtual, membroSelecionado])

  useEffect(() => {

    async function iniciarEquipe() {

      const { data } = await supabase.auth.getUser()

      if (!data.user) return

      const email = data.user.email

const nome = email
  .split('@')[0]
  .replace(/^@+/, '')
  .replace(/[._-]/g, ' ')
  .replace(/\b\w/g, letra => letra.toUpperCase())

      const { data: membro } = await supabase
        .from('equipe_membros')
        .upsert([
          {
            user_id: data.user.id,
            nome,
            email,
            status_online: true,
            ultimo_acesso: new Date().toISOString()
          }
        ], {
          onConflict: 'user_id'
        })
        .select()
        .single()

      setMembroAtual(membro)

      await carregarMembros()
      await carregarMensagensEquipe()
    }

    iniciarEquipe()

  }, [carregarMembros, carregarMensagensEquipe])

  useEffect(() => {

    if (!membroAtual) return

    const canalEquipe = supabase
      .channel('chat-geral-equipe')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens_equipe'
        },
        async () => {
          await carregarMensagensEquipe()
        }
      )
      .subscribe()

    const canalPrivado = supabase
      .channel('chat-privado-equipe')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens_privadas'
        },
        async () => {
          if (membroSelecionado) {
            await carregarMensagensPrivadas(membroSelecionado, membroAtual)
          }
        }
      )
      .subscribe()

    const canalMembros = supabase
      .channel('membros-online')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipe_membros'
        },
        async () => {
          await carregarMembros()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalEquipe)
      supabase.removeChannel(canalPrivado)
      supabase.removeChannel(canalMembros)
    }

  }, [
    membroAtual,
    membroSelecionado,
    carregarMembros,
    carregarMensagensEquipe,
    carregarMensagensPrivadas
  ])

  async function enviarMensagemEquipe() {
    if (!mensagemEquipe.trim()) return
    if (!membroAtual) return

    await supabase
      .from('mensagens_equipe')
      .insert([
        {
          remetente_id: membroAtual.id,
          mensagem: mensagemEquipe
        }
      ])

    setMensagemEquipe('')
    await carregarMensagensEquipe()
  }

  async function enviarMensagemPrivada() {
    if (!mensagemPrivada.trim()) return
    if (!membroAtual || !membroSelecionado) return

    await supabase
      .from('mensagens_privadas')
      .insert([
        {
          remetente_id: membroAtual.id,
          destinatario_id: membroSelecionado.id,
          mensagem: mensagemPrivada
        }
      ])

    setMensagemPrivada('')
    await carregarMensagensPrivadas(membroSelecionado, membroAtual)
  }

  async function selecionarMembro(membro) {
    setMembroSelecionado(membro)
    await carregarMensagensPrivadas(membro, membroAtual)
  }

  return (
    <div>

      <div className="page-header">
        <h1>Equipe</h1>
      </div>

      <div className="team-chat-layout">

        <div className="card">

          <div className="card-title">
            <Users size={22} />
            Membros Online
          </div>

          <div className="online-list">

            {membros.map(membro => (
              <button
                key={membro.id}
                className={
                  membroSelecionado?.id === membro.id
                    ? 'online-member selected'
                    : 'online-member'
                }
                onClick={() => selecionarMembro(membro)}
              >
                <div className="online-avatar">
                  {membro.nome.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{membro.nome}</strong>
                  <span>{membro.email}</span>
                </div>

                <Circle
                  size={12}
                  className={membro.status_online ? 'online-dot' : 'offline-dot'}
                />
              </button>
            ))}

          </div>

        </div>

        <div className="card chat-card">

          <div className="card-title">
            <MessageCircle size={22} />
            Chat Geral
          </div>

          <div className="chat-box">

            {mensagensEquipe.map(msg => (
              <div
                key={msg.id}
                className={
                  msg.remetente_id === membroAtual?.id
                    ? 'chat-message mine'
                    : 'chat-message'
                }
              >
                <strong>
                  {msg.remetente_id === membroAtual?.id
                    ? 'Você'
                    : msg.equipe_membros?.nome || 'Membro'}
                </strong>

                <p>{msg.mensagem}</p>
              </div>
            ))}

          </div>

          <div className="chat-input">
            <input
              placeholder="Mensagem para toda a equipe..."
              value={mensagemEquipe}
              onChange={(e) => setMensagemEquipe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') enviarMensagemEquipe()
              }}
            />

            <button onClick={enviarMensagemEquipe}>
              <Send size={18} />
            </button>
          </div>

        </div>

      </div>

      <div className="card chat-card">

        <div className="card-title">
          <MessageCircle size={22} />
          Chat Individual
        </div>

        {!membroSelecionado ? (
          <div className="empty-chat">
            Selecione um membro para iniciar uma conversa individual.
          </div>
        ) : (
          <>
            <div className="private-chat-header">
              Conversa com <strong>{membroSelecionado.nome}</strong>
            </div>

            <div className="chat-box private">

              {mensagensPrivadas.map(msg => (
                <div
                  key={msg.id}
                  className={
                    msg.remetente_id === membroAtual?.id
                      ? 'chat-message mine'
                      : 'chat-message'
                  }
                >
                  <strong>
                    {msg.remetente_id === membroAtual?.id
                      ? 'Você'
                      : membroSelecionado.nome}
                  </strong>

                  <p>{msg.mensagem}</p>
                </div>
              ))}

            </div>

            <div className="chat-input">
              <input
                placeholder={`Mensagem para ${membroSelecionado.nome}...`}
                value={mensagemPrivada}
                onChange={(e) => setMensagemPrivada(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') enviarMensagemPrivada()
                }}
              />

              <button onClick={enviarMensagemPrivada}>
                <Send size={18} />
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  )
}