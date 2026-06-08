import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import ConfirmModal from '../components/ConfirmModal'

export default function Financeiro() {
  const [clientes, setClientes] = useState([])
  const [registros, setRegistros] = useState([])

  const [clienteId, setClienteId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [status, setStatus] = useState('Pendente')
  const [dataPagamento, setDataPagamento] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [mesReferencia, setMesReferencia] = useState('')

  const [filtroMes, setFiltroMes] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [buscaDescricao, setBuscaDescricao] = useState('')

  const [registroEditando, setRegistroEditando] = useState(null)

  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null)

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto)
    setTipoMensagem(tipo)

    setTimeout(() => {
      setMensagem('')
      setTipoMensagem('')
    }, 4000)
  }

  const carregarClientes = useCallback(async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')

    if (error) {
      console.log(error)
      mostrarMensagem(error.message || 'Erro ao carregar clientes.', 'erro')
      return
    }

    setClientes(data || [])
  }, [])

  const carregarFinanceiro = useCallback(async () => {
    const { data, error } = await supabase
      .from('financeiro')
      .select(`
        *,
        clientes (
          nome
        )
      `)
      .order('id', { ascending: false })

    if (error) {
      console.log(error)
      mostrarMensagem(error.message || 'Erro ao carregar registros.', 'erro')
      return
    }

    setRegistros(data || [])
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarClientes()
      carregarFinanceiro()
    }, 0)

    return () => clearTimeout(timer)
  }, [carregarClientes, carregarFinanceiro])

  function validarFormulario() {
    if (!clienteId) {
      mostrarMensagem('Selecione um cliente.', 'erro')
      return false
    }

    if (!descricao.trim()) {
      mostrarMensagem('Preencha a descrição.', 'erro')
      return false
    }

    if (!valor || Number(valor) <= 0) {
      mostrarMensagem('Informe um valor válido.', 'erro')
      return false
    }

    if (!mesReferencia) {
      mostrarMensagem('Informe o mês de referência.', 'erro')
      return false
    }

    if (!dataVencimento) {
      mostrarMensagem('Informe a data de vencimento.', 'erro')
      return false
    }

    if (status === 'Pago' && !dataPagamento) {
      mostrarMensagem('Informe a data de pagamento.', 'erro')
      return false
    }

    return true
  }

  function montarPayload() {
    return {
      cliente_id: Number(clienteId),
      descricao: descricao.trim(),
      valor: Number(valor),
      status,
      data_pagamento: status === 'Pago' ? dataPagamento || null : null,
      data_vencimento: dataVencimento || null,
      forma_pagamento: formaPagamento || null,
      mes_referencia: mesReferencia
    }
  }

  async function salvarRegistro() {
    if (!validarFormulario()) return

    const { error } = await supabase
      .from('financeiro')
      .insert([montarPayload()])

    if (error) {
      console.log(error)
      mostrarMensagem(error.message || 'Erro ao salvar registro.', 'erro')
      return
    }

    limparFormulario()
    await carregarFinanceiro()
    mostrarMensagem('Registro cadastrado com sucesso.', 'sucesso')
  }

  async function atualizarRegistro() {
    if (!validarFormulario()) return

    const { error } = await supabase
      .from('financeiro')
      .update(montarPayload())
      .eq('id', registroEditando)

    if (error) {
      console.log(error)
      mostrarMensagem(error.message || 'Erro ao atualizar registro.', 'erro')
      return
    }

    limparFormulario()
    await carregarFinanceiro()
    mostrarMensagem('Registro atualizado com sucesso.', 'sucesso')
  }

  function abrirModalExclusao(registro) {
    setRegistroParaExcluir(registro)
    setModalAberto(true)
  }

  function fecharModalExclusao() {
    setRegistroParaExcluir(null)
    setModalAberto(false)
  }

  async function confirmarExclusao() {
    if (!registroParaExcluir) return

    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', registroParaExcluir.id)

    if (error) {
      console.log(error)
      mostrarMensagem(error.message || 'Erro ao excluir registro.', 'erro')
      fecharModalExclusao()
      return
    }

    await carregarFinanceiro()
    mostrarMensagem('Registro excluído com sucesso.', 'sucesso')
    fecharModalExclusao()
  }

  function editarRegistro(registro) {
    setRegistroEditando(registro.id)
    setClienteId(String(registro.cliente_id || ''))
    setDescricao(registro.descricao || '')
    setValor(String(registro.valor || ''))
    setStatus(registro.status || 'Pendente')
    setDataPagamento(registro.data_pagamento || '')
    setDataVencimento(registro.data_vencimento || '')
    setFormaPagamento(registro.forma_pagamento || '')
    setMesReferencia(registro.mes_referencia || '')

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function limparFormulario() {
    setClienteId('')
    setDescricao('')
    setValor('')
    setStatus('Pendente')
    setDataPagamento('')
    setDataVencimento('')
    setFormaPagamento('')
    setMesReferencia('')
    setRegistroEditando(null)
  }

  function limparFiltros() {
    setFiltroMes('')
    setFiltroCliente('')
    setFiltroStatus('')
    setBuscaDescricao('')
  }

  function mostrarStatus(statusAtual) {
    if (statusAtual === 'Pago') {
      return <span className="status-badge status-concluido">Pago</span>
    }

    if (statusAtual === 'Pendente') {
      return <span className="status-badge status-aguardando">Pendente</span>
    }

    if (statusAtual === 'Atrasado') {
      return <span className="status-badge status-cancelado">Atrasado</span>
    }

    if (statusAtual === 'Cancelado') {
      return <span className="status-badge status-cancelado">Cancelado</span>
    }

    return statusAtual
  }

  const registrosFiltrados = useMemo(() => {
    return registros.filter(registro => {
      const mesCorresponde = filtroMes
        ? registro.mes_referencia === filtroMes
        : true

      const clienteCorresponde = filtroCliente
        ? String(registro.cliente_id) === String(filtroCliente)
        : true

      const statusCorresponde = filtroStatus
        ? registro.status === filtroStatus
        : true

      const descricaoCorresponde = buscaDescricao
        ? String(registro.descricao || '').toLowerCase().includes(buscaDescricao.toLowerCase())
        : true

      return (
        mesCorresponde &&
        clienteCorresponde &&
        statusCorresponde &&
        descricaoCorresponde
      )
    })
  }, [registros, filtroMes, filtroCliente, filtroStatus, buscaDescricao])

  const totalRecebido = registrosFiltrados
    .filter(registro => registro.status === 'Pago')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  const totalPendente = registrosFiltrados
    .filter(registro => registro.status === 'Pendente')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  const totalAtrasado = registrosFiltrados
    .filter(registro => registro.status === 'Atrasado')
    .reduce((soma, registro) => soma + Number(registro.valor || 0), 0)

  return (
    <div>
      <div className="page-header">
        <h1>Financeiro</h1>
        <p>Controle de receitas, vencimentos e pagamentos</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            R$ {totalRecebido.toFixed(2)}
          </div>
          <div className="stat-title">
            Recebido
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            R$ {totalPendente.toFixed(2)}
          </div>
          <div className="stat-title">
            Pendente
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            R$ {totalAtrasado.toFixed(2)}
          </div>
          <div className="stat-title">
            Atrasado
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Filtros Financeiros
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Buscar por descrição</label>
            <input
              value={buscaDescricao}
              onChange={(e) => setBuscaDescricao(e.target.value)}
              placeholder="Ex: mensalidade, logo, tráfego..."
            />
          </div>

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
            <label>Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mês</label>
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            />
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
          {registroEditando ? 'Editar Registro' : 'Novo Registro Financeiro'}
        </div>

        {mensagem && (
          <div className={`alert ${tipoMensagem === 'erro' ? 'alert-error' : 'alert-success'}`}>
            {mensagem}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Mensalidade, logo, tráfego..."
            />
          </div>

          <div className="form-group">
            <label>Valor</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 500"
            />
          </div>

          <div className="form-group">
            <label>Mês de Referência</label>
            <input
              type="month"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão</option>
              <option value="Boleto">Boleto</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Transferência">Transferência</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data de Vencimento</label>
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data de Pagamento</label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              disabled={status !== 'Pago'}
            />
          </div>
        </div>

        <div className="actions">
          {registroEditando ? (
            <>
              <button className="btn-primary" onClick={atualizarRegistro}>
                Atualizar Registro
              </button>

              <button className="btn-secondary" onClick={limparFormulario}>
                Cancelar
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={salvarRegistro}>
              Salvar Registro
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Registros Financeiros ({registrosFiltrados.length})
        </div>

        <div className="table-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Mês</th>
                <th>Vencimento</th>
                <th>Pagamento</th>
                <th>Forma</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {registrosFiltrados.map(registro => (
                <tr key={registro.id}>
                  <td>{registro.id}</td>

                  <td>
                    {registro.clientes?.nome || 'Cliente não encontrado'}
                  </td>

                  <td>{registro.descricao}</td>

                  <td>
                    R$ {Number(registro.valor || 0).toFixed(2)}
                  </td>

                  <td>
                    {mostrarStatus(registro.status)}
                  </td>

                  <td>{registro.mes_referencia || '-'}</td>

                  <td>{registro.data_vencimento || '-'}</td>

                  <td>{registro.data_pagamento || '-'}</td>

                  <td>{registro.forma_pagamento || '-'}</td>

                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => editarRegistro(registro)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => abrirModalExclusao(registro)}
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
        titulo="Excluir registro financeiro"
        mensagem={`Tem certeza que deseja excluir "${registroParaExcluir?.descricao || 'este registro'}"? Essa ação não poderá ser desfeita.`}
        textoCancelar="Cancelar"
        textoConfirmar="Excluir"
        aoCancelar={fecharModalExclusao}
        aoConfirmar={confirmarExclusao}
      />
    </div>
  )
}