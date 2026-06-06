import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import ConfirmModal from '../components/ConfirmModal'

export default function Clientes() {

  const [clientes, setClientes] = useState([])

  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [telefone, setTelefone] = useState('')

  const [clienteEditando, setClienteEditando] = useState(null)

  const [pesquisa, setPesquisa] = useState('')

  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null)

  useEffect(() => {

    async function carregarDados() {

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.log(error)
        setMensagem('Erro ao carregar clientes.')
        setTipoMensagem('erro')
        return
      }

      setClientes(data)
    }

    carregarDados()

  }, [])

  async function carregarClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao carregar clientes.', 'erro')
      return
    }

    setClientes(data)
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
    if (!nome.trim()) {
      mostrarMensagem('Preencha o nome do cliente.', 'erro')
      return false
    }

    if (!empresa.trim()) {
      mostrarMensagem('Preencha o nome da empresa.', 'erro')
      return false
    }

    if (!telefone.trim()) {
      mostrarMensagem('Preencha o telefone do cliente.', 'erro')
      return false
    }

    return true
  }

  async function salvarCliente() {
    if (!validarFormulario()) return

    const { error } = await supabase
      .from('clientes')
      .insert([
        {
          nome,
          empresa,
          telefone
        }
      ])

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao salvar cliente.', 'erro')
      return
    }

    limparFormulario()
    carregarClientes()
    mostrarMensagem('Cliente cadastrado com sucesso.', 'sucesso')
  }

  async function atualizarCliente() {
    if (!validarFormulario()) return

    const { error } = await supabase
      .from('clientes')
      .update({
        nome,
        empresa,
        telefone
      })
      .eq('id', clienteEditando)

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao atualizar cliente.', 'erro')
      return
    }

    limparFormulario()
    carregarClientes()
    mostrarMensagem('Cliente atualizado com sucesso.', 'sucesso')
  }

  function abrirModalExclusao(cliente) {
    setClienteParaExcluir(cliente)
    setModalAberto(true)
  }

  function fecharModalExclusao() {
    setClienteParaExcluir(null)
    setModalAberto(false)
  }

  async function confirmarExclusao() {
    if (!clienteParaExcluir) return

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteParaExcluir.id)

    if (error) {
      console.log(error)
      mostrarMensagem('Erro ao excluir cliente.', 'erro')
      fecharModalExclusao()
      return
    }

    carregarClientes()
    mostrarMensagem('Cliente excluído com sucesso.', 'sucesso')
    fecharModalExclusao()
  }

  function editarCliente(cliente) {
    setClienteEditando(cliente.id)

    setNome(cliente.nome)
    setEmpresa(cliente.empresa)
    setTelefone(cliente.telefone)
  }

  function limparFormulario() {
    setNome('')
    setEmpresa('')
    setTelefone('')
    setClienteEditando(null)
  }

  const clientesFiltrados = clientes.filter(cliente => {
    return (
      cliente.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(pesquisa.toLowerCase())
    )
  })

  return (
    <div>

      <div className="page-header">
        <h1>Clientes</h1>
        <p>Gerencie todos os clientes da Designer Fácil</p>
      </div>

      <div className="card">

        <div className="card-title">
          {clienteEditando ? 'Editar Cliente' : 'Cadastro de Cliente'}
        </div>

        {mensagem && (
          <div className={`alert ${tipoMensagem === 'erro' ? 'alert-error' : 'alert-success'}`}>
            {mensagem}
          </div>
        )}

        <div className="form-grid">

          <div className="form-group">
            <label>Nome</label>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Empresa</label>

            <input
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>

            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

        </div>

        <div className="actions">

          {clienteEditando ? (
            <>
              <button
                className="btn-primary"
                onClick={atualizarCliente}
              >
                Atualizar Cliente
              </button>

              <button
                className="btn-secondary"
                onClick={limparFormulario}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              onClick={salvarCliente}
            >
              Salvar Cliente
            </button>
          )}

        </div>

      </div>

      <div className="card">

        <div className="card-title">
          Buscar Cliente
        </div>

        <input
          className="search-input"
          placeholder="Pesquisar por nome ou empresa"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />

      </div>

      <div className="card">

        <div className="card-title">
          Clientes Cadastrados
        </div>

        <div className="table-container">

          <table className="client-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>

                  <td>{cliente.id}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.empresa}</td>
                  <td>{cliente.telefone}</td>

                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => editarCliente(cliente)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => abrirModalExclusao(cliente)}
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
        titulo="Excluir cliente"
        mensagem={`Tem certeza que deseja excluir ${clienteParaExcluir?.nome || 'este cliente'}? Essa ação não poderá ser desfeita.`}
        textoCancelar="Cancelar"
        textoConfirmar="Excluir"
        aoCancelar={fecharModalExclusao}
        aoConfirmar={confirmarExclusao}
      />

    </div>
  )
}