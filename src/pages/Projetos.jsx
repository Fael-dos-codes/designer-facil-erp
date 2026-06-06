import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import ConfirmModal from '../components/ConfirmModal'

export default function Projetos() {

  const [clientes, setClientes] = useState([])
  const [projetos, setProjetos] = useState([])

  const [clienteId, setClienteId] = useState('')
  const [servico, setServico] = useState('')
  const [status, setStatus] = useState('Aguardando')
  const [valor, setValor] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataEntrega, setDataEntrega] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [prioridade, setPrioridade] = useState('Média')
  const [observacoes, setObservacoes] = useState('')

  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroServico, setFiltroServico] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPrioridade, setFiltroPrioridade] = useState('')

  const [projetoEditando, setProjetoEditando] = useState(null)

  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [projetoParaExcluir, setProjetoParaExcluir] = useState(null)

  useEffect(() => {

    async function carregarDados() {

      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .order('nome')

      if (clientesError) {
        console.log(clientesError)
        return
      }

      setClientes(clientesData)

      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos')
        .select(`
          *,
          clientes (
            nome
          )
        `)
        .order('id', { ascending: false })

      if (projetosError) {
        console.log(projetosError)
        return
      }

      setProjetos(projetosData)
    }

    carregarDados()

  }, [])

  async function carregarProjetos() {

    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        clientes (
          nome
        )
      `)
      .order('id', { ascending: false })

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao carregar projetos.', 'erro')
      return
    }

    setProjetos(data)
  }

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto)
    setTipoMensagem(tipo)

    setTimeout(() => {
      setMensagem('')
      setTipoMensagem('')
    }, 3000)
  }

  function validarFormulario() {
    if (!clienteId) {
      mostrarMensagem('Selecione um cliente.', 'erro')
      return false
    }

    if (!servico) {
      mostrarMensagem('Selecione um serviço.', 'erro')
      return false
    }

    if (!valor || Number(valor) <= 0) {
      mostrarMensagem('Informe um valor válido.', 'erro')
      return false
    }

    if (!responsavel.trim()) {
      mostrarMensagem('Informe o responsável pelo projeto.', 'erro')
      return false
    }

    return true
  }

  async function salvarProjeto() {
    if (!validarFormulario()) return

    const { error } = await supabase
      .from('projetos')
      .insert([
        {
          cliente_id: clienteId,
          servico,
          status,
          valor,
          data_inicio: dataInicio || null,
          data_entrega: dataEntrega || null,
          responsavel,
          prioridade,
          observacoes
        }
      ])

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao salvar projeto.', 'erro')
      return
    }

    limparFormulario()
    carregarProjetos()
    mostrarMensagem('Projeto cadastrado com sucesso.', 'sucesso')
  }

  async function atualizarProjeto() {
    if (!validarFormulario()) return

    const { error } = await supabase
      .from('projetos')
      .update({
        cliente_id: clienteId,
        servico,
        status,
        valor,
        data_inicio: dataInicio || null,
        data_entrega: dataEntrega || null,
        responsavel,
        prioridade,
        observacoes
      })
      .eq('id', projetoEditando)

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao atualizar projeto.', 'erro')
      return
    }

    limparFormulario()
    carregarProjetos()
    mostrarMensagem('Projeto atualizado com sucesso.', 'sucesso')
  }

  function abrirModalExclusao(projeto) {
    setProjetoParaExcluir(projeto)
    setModalAberto(true)
  }

  function fecharModalExclusao() {
    setProjetoParaExcluir(null)
    setModalAberto(false)
  }

  async function confirmarExclusao() {
    if (!projetoParaExcluir) return

    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', projetoParaExcluir.id)

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao excluir projeto.', 'erro')
      fecharModalExclusao()
      return
    }

    carregarProjetos()
    mostrarMensagem('Projeto excluído com sucesso.', 'sucesso')
    fecharModalExclusao()
  }

  function editarProjeto(projeto) {
    setProjetoEditando(projeto.id)

    setClienteId(projeto.cliente_id)
    setServico(projeto.servico)
    setStatus(projeto.status)
    setValor(projeto.valor)
    setDataInicio(projeto.data_inicio || '')
    setDataEntrega(projeto.data_entrega || '')
    setResponsavel(projeto.responsavel || '')
    setPrioridade(projeto.prioridade || 'Média')
    setObservacoes(projeto.observacoes || '')
  }

  function limparFormulario() {
    setClienteId('')
    setServico('')
    setStatus('Aguardando')
    setValor('')
    setDataInicio('')
    setDataEntrega('')
    setResponsavel('')
    setPrioridade('Média')
    setObservacoes('')
    setProjetoEditando(null)
  }

  function limparFiltros() {
    setFiltroCliente('')
    setFiltroServico('')
    setFiltroStatus('')
    setFiltroPrioridade('')
  }

  function mostrarStatus(status) {
    if (status === 'Aguardando') {
      return <span className="status-badge status-aguardando">Aguardando</span>
    }

    if (status === 'Em andamento') {
      return <span className="status-badge status-andamento">Em andamento</span>
    }

    if (status === 'Concluído') {
      return <span className="status-badge status-concluido">Concluído</span>
    }

    if (status === 'Cancelado') {
      return <span className="status-badge status-cancelado">Cancelado</span>
    }

    return status
  }

  function mostrarPrioridade(prioridade) {
    if (prioridade === 'Alta') {
      return <span className="status-badge priority-alta">Alta</span>
    }

    if (prioridade === 'Média') {
      return <span className="status-badge priority-media">Média</span>
    }

    if (prioridade === 'Baixa') {
      return <span className="status-badge priority-baixa">Baixa</span>
    }

    return prioridade
  }

  const projetosFiltrados = projetos.filter(projeto => {
    const clienteCorresponde = filtroCliente
      ? String(projeto.cliente_id) === String(filtroCliente)
      : true

    const servicoCorresponde = filtroServico
      ? projeto.servico === filtroServico
      : true

    const statusCorresponde = filtroStatus
      ? projeto.status === filtroStatus
      : true

    const prioridadeCorresponde = filtroPrioridade
      ? projeto.prioridade === filtroPrioridade
      : true

    return (
      clienteCorresponde &&
      servicoCorresponde &&
      statusCorresponde &&
      prioridadeCorresponde
    )
  })

  return (
    <div>

      <div className="page-header">
        <h1>Projetos</h1>
        <p>Gerencie serviços, prazos, responsáveis e prioridades</p>
      </div>

      <div className="card">

        <div className="card-title">
          {projetoEditando ? 'Editar Projeto' : 'Novo Projeto'}
        </div>

        {mensagem && (
          <div className={`alert ${tipoMensagem === 'erro' ? 'alert-error' : 'alert-success'}`}>
            {mensagem}
          </div>
        )}

        <div className="form-grid">

          <div className="form-group">
            <label>Cliente</label>

            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione um cliente</option>

              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Serviço</label>

            <select
              value={servico}
              onChange={(e) => setServico(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Marketing Digital">Marketing Digital</option>
              <option value="Tráfego Pago">Tráfego Pago</option>
              <option value="Design">Design</option>
              <option value="Edição de Vídeo">Edição de Vídeo</option>
              <option value="Criação de Logo">Criação de Logo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Aguardando">Aguardando</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Prioridade</label>

            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div className="form-group">
            <label>Valor</label>

            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Responsável</label>

            <input
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data de Início</label>

            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data de Entrega</label>

            <input
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Observações</label>

            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

        </div>

        <div className="actions">

          {projetoEditando ? (
            <>
              <button className="btn-primary" onClick={atualizarProjeto}>
                Atualizar Projeto
              </button>

              <button className="btn-secondary" onClick={limparFormulario}>
                Cancelar
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={salvarProjeto}>
              Salvar Projeto
            </button>
          )}

        </div>

      </div>

      <div className="card">

        <div className="card-title">
          Filtros de Projetos
        </div>

        <div className="form-grid">

          <div className="form-group">
            <label>Cliente</label>

            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
            >
              <option value="">Todos</option>

              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Serviço</label>

            <select
              value={filtroServico}
              onChange={(e) => setFiltroServico(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Marketing Digital">Marketing Digital</option>
              <option value="Tráfego Pago">Tráfego Pago</option>
              <option value="Design">Design</option>
              <option value="Edição de Vídeo">Edição de Vídeo</option>
              <option value="Criação de Logo">Criação de Logo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Prioridade</label>

            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

        </div>

        <div className="actions">
          <button
            className="btn-secondary"
            onClick={limparFiltros}
          >
            Limpar Filtros
          </button>
        </div>

      </div>

      <div className="card">

        <div className="card-title">
          Projetos Cadastrados ({projetosFiltrados.length})
        </div>

        <div className="table-container">

          <table className="client-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Responsável</th>
                <th>Entrega</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {projetosFiltrados.map(projeto => (
                <tr key={projeto.id}>

                  <td>{projeto.id}</td>

                  <td>
                    {projeto.clientes?.nome || 'Não encontrado'}
                  </td>

                  <td>{projeto.servico}</td>

                  <td>
                    {mostrarStatus(projeto.status)}
                  </td>

                  <td>
                    {mostrarPrioridade(projeto.prioridade)}
                  </td>

                  <td>
                    {projeto.responsavel || '-'}
                  </td>

                  <td>
                    {projeto.data_entrega || '-'}
                  </td>

                  <td>
                    R$ {Number(projeto.valor || 0).toFixed(2)}
                  </td>

                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => editarProjeto(projeto)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => abrirModalExclusao(projeto)}
                    >
                      Excluir
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

      <ConfirmModal
        aberto={modalAberto}
        titulo="Excluir projeto"
        mensagem={`Tem certeza que deseja excluir o projeto "${projetoParaExcluir?.servico || ''}"? Essa ação não poderá ser desfeita.`}
        textoCancelar="Cancelar"
        textoConfirmar="Excluir"
        aoCancelar={fecharModalExclusao}
        aoConfirmar={confirmarExclusao}
      />

    </div>
  )
}