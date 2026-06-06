import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function Configuracoes() {

  const [configId, setConfigId] = useState(null)

  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [cidade, setCidade] = useState('')

  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  useEffect(() => {

    async function carregarConfiguracoes() {

      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.log(error)
        return
      }

      if (data) {
        setConfigId(data.id)
        setNomeEmpresa(data.nome_empresa || '')
        setResponsavel(data.responsavel || '')
        setTelefone(data.telefone || '')
        setEmail(data.email || '')
        setInstagram(data.instagram || '')
        setCidade(data.cidade || '')
      }
    }

    carregarConfiguracoes()

  }, [])

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto)
    setTipoMensagem(tipo)

    setTimeout(() => {
      setMensagem('')
      setTipoMensagem('')
    }, 3000)
  }

  function validarFormulario() {
    if (!nomeEmpresa.trim()) {
      mostrarMensagem('Preencha o nome da empresa.', 'erro')
      return false
    }

    if (!responsavel.trim()) {
      mostrarMensagem('Preencha o responsável.', 'erro')
      return false
    }

    return true
  }

  async function salvarConfiguracoes() {
    if (!validarFormulario()) return

    if (configId) {
      const { error } = await supabase
        .from('configuracoes_empresa')
        .update({
          nome_empresa: nomeEmpresa,
          responsavel,
          telefone,
          email,
          instagram,
          cidade
        })
        .eq('id', configId)

      if (error) {
        console.log(error)
        mostrarMensagem('Erro ao atualizar configurações.', 'erro')
        return
      }

      mostrarMensagem('Configurações atualizadas com sucesso.', 'sucesso')
      return
    }

    const { data, error } = await supabase
      .from('configuracoes_empresa')
      .insert([
        {
          nome_empresa: nomeEmpresa,
          responsavel,
          telefone,
          email,
          instagram,
          cidade
        }
      ])
      .select()
      .single()

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao salvar configurações.', 'erro')
      return
    }

    setConfigId(data.id)
    mostrarMensagem('Configurações salvas com sucesso.', 'sucesso')
  }

  return (
    <div>

      <div className="page-header">
        <h1>Configurações da Empresa</h1>
        <p>Organize as informações principais usadas no sistema</p>
      </div>

      <div className="settings-grid">

        <div className="card settings-card">

          <div className="card-title">
            Identidade da Empresa
          </div>

          <p className="settings-description">
            Dados principais da Designer Fácil.
          </p>

          {mensagem && (
            <div className={`alert ${tipoMensagem === 'erro' ? 'alert-error' : 'alert-success'}`}>
              {mensagem}
            </div>
          )}

          <div className="form-grid">

            <div className="form-group">
              <label>Nome da Empresa</label>

              <input
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                placeholder="Designer Fácil"
              />
            </div>

            <div className="form-group">
              <label>Responsável</label>

              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="form-group">
              <label>Cidade</label>

              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Uberlândia - MG"
              />
            </div>

          </div>

        </div>

        <div className="card settings-card">

          <div className="card-title">
            Contato e Redes Sociais
          </div>

          <p className="settings-description">
            Informações para atendimento e identificação da empresa.
          </p>

          <div className="form-grid">

            <div className="form-group">
              <label>Telefone</label>

              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(34) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@designerfacil.com"
              />
            </div>

            <div className="form-group">
              <label>Instagram</label>

              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@designerfacil"
              />
            </div>

          </div>

          <div className="actions">
            <button
              className="btn-primary"
              onClick={salvarConfiguracoes}
            >
              Salvar Configurações
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}