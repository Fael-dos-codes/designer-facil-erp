import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabase'

const PRESENCA_LIMITE_MS = 60 * 1000
const HEARTBEAT_MS = 15 * 1000

function montarNome(email = '') {
  return email
    .split('@')[0]
    .replace(/^@+/, '')
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, letra => letra.toUpperCase())
}

function notificar(titulo, mensagem) {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification(titulo, {
      body: mensagem,
      icon: '/favicon.svg'
    })
  }
}

export default function TeamPresenceNotifications() {
  const [membroAtual, setMembroAtual] = useState(null)
  const membroRef = useRef(null)

  const atualizarPresenca = useCallback(async (online = true) => {
    const membro = membroRef.current
    if (!membro) return

    await supabase
      .from('equipe_membros')
      .update({
        status_online: online,
        ultimo_acesso: new Date().toISOString()
      })
      .eq('id', membro.id)
  }, [])

  useEffect(() => {
    let intervaloPresenca
    let cancelado = false

    async function iniciar() {
      const { data } = await supabase.auth.getUser()
      if (!data.user || cancelado) return

      const email = data.user.email

      const { data: membro } = await supabase
        .from('equipe_membros')
        .upsert([
          {
            user_id: data.user.id,
            nome: montarNome(email),
            email,
            status_online: true,
            ultimo_acesso: new Date().toISOString()
          }
        ], { onConflict: 'user_id' })
        .select()
        .single()

      if (!membro || cancelado) return

      membroRef.current = membro
      setMembroAtual(membro)

      intervaloPresenca = setInterval(() => {
        if (!document.hidden) {
            atualizarPresenca(true)
        }
}, HEARTBEAT_MS)

    }

    iniciar()

    function aoSair() {
      const membro = membroRef.current
      if (!membro) return

      supabase
        .from('equipe_membros')
        .update({ status_online: false, ultimo_acesso: new Date().toISOString() })
        .eq('id', membro.id)
        .then(() => {})
    }

    function aoMudarVisibilidade() {
      if (document.hidden) {
        atualizarPresenca(false)
      } else {
        atualizarPresenca(true)
      }
    }

    window.addEventListener('beforeunload', aoSair)
    window.addEventListener('pagehide', aoSair)
    document.addEventListener('visibilitychange', aoMudarVisibilidade)

    return () => {
      cancelado = true
      clearInterval(intervaloPresenca)
      aoSair()
      window.removeEventListener('beforeunload', aoSair)
      window.removeEventListener('pagehide', aoSair)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [atualizarPresenca])

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!membroAtual) return

    const chavePrivada = `df_ultima_msg_privada_${membroAtual.id}`
    const chaveEquipe = `df_ultima_msg_equipe_${membroAtual.id}`

    async function prepararHistorico() {
      const { data: privadas } = await supabase
        .from('mensagens_privadas')
        .select('id, mensagem, remetente_id')
        .eq('destinatario_id', membroAtual.id)
        .order('id', { ascending: false })
        .limit(5)

      const ultimaPrivada = privadas?.[0]
      const privadaSalva = Number(localStorage.getItem(chavePrivada) || 0)

      if (!privadaSalva && ultimaPrivada) {
        localStorage.setItem(chavePrivada, String(ultimaPrivada.id))
      } else if (ultimaPrivada && ultimaPrivada.id > privadaSalva) {
        notificar('Nova mensagem individual', ultimaPrivada.mensagem)
        localStorage.setItem(chavePrivada, String(ultimaPrivada.id))
      }

      const { data: equipe } = await supabase
        .from('mensagens_equipe')
        .select('id, mensagem, remetente_id')
        .neq('remetente_id', membroAtual.id)
        .order('id', { ascending: false })
        .limit(5)

      const ultimaEquipe = equipe?.[0]
      const equipeSalva = Number(localStorage.getItem(chaveEquipe) || 0)

      if (!equipeSalva && ultimaEquipe) {
        localStorage.setItem(chaveEquipe, String(ultimaEquipe.id))
      } else if (ultimaEquipe && ultimaEquipe.id > equipeSalva) {
        notificar('Nova mensagem no chat geral', ultimaEquipe.mensagem)
        localStorage.setItem(chaveEquipe, String(ultimaEquipe.id))
      }
    }

    prepararHistorico()

    const canalPrivado = supabase
      .channel(`notificacoes-privadas-${membroAtual.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_privadas',
          filter: `destinatario_id=eq.${membroAtual.id}`
        },
        async ({ new: novaMensagem }) => {
          if (!novaMensagem || novaMensagem.remetente_id === membroAtual.id) return

          localStorage.setItem(chavePrivada, String(novaMensagem.id))
          notificar('Nova mensagem individual', novaMensagem.mensagem)
        }
      )
      .subscribe()

    const canalEquipe = supabase
      .channel(`notificacoes-equipe-${membroAtual.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_equipe'
        },
        async ({ new: novaMensagem }) => {
          if (!novaMensagem || novaMensagem.remetente_id === membroAtual.id) return

          localStorage.setItem(chaveEquipe, String(novaMensagem.id))
          notificar('Nova mensagem no chat geral', novaMensagem.mensagem)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalPrivado)
      supabase.removeChannel(canalEquipe)
    }
  }, [membroAtual])

  return null
}

export { PRESENCA_LIMITE_MS }