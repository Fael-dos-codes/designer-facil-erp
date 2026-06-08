import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import { PlusCircle, Search, Trash2, Upload } from 'lucide-react'

const AREAS = [
  'Design',
  'Tráfego Pago',
  'Marketing Digital',
  'Edição de Vídeo',
  'Criação de Logo'
]

const TIPOS = ['Link', 'Foto', 'Vídeo', 'Arquivo']

const formularioInicial = {
  titulo: '',
  area: AREAS[0],
  tipo: TIPOS[0],
  url: '',
  descricao: '',
  autor_nome: ''
}

export default function Entregas() {
  const [entregas, setEntregas] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [arquivo, setArquivo] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('Todas')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [carregando, setCarregando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const carregarEntregas = useCallback(async () => {
    setCarregando(true)

    const { data } = await supabase
      .from('trabalhos_entregues')
      .select('*')
      .order('created_at', { ascending: false })

    setEntregas(data || [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getUser()
      const email = data.user?.email || ''

      const nomePadrao = email
        ? email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, letra => letra.toUpperCase())
        : ''

      setFormulario(atual => ({ ...atual, autor_nome: nomePadrao }))
      await carregarEntregas()
    }

    iniciar()
  }, [carregarEntregas])

  const entregasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return entregas.filter(entrega => {
      const combinaBusca = !termo || [
        entrega.titulo,
        entrega.descricao,
        entrega.autor_nome,
        entrega.area,
        entrega.tipo,
        entrega.url
      ].some(campo => String(campo || '').toLowerCase().includes(termo))

      const combinaArea = filtroArea === 'Todas' || entrega.area === filtroArea
      const combinaTipo = filtroTipo === 'Todos' || entrega.tipo === filtroTipo

      return combinaBusca && combinaArea && combinaTipo
    })
  }, [busca, entregas, filtroArea, filtroTipo])

  function atualizarCampo(campo, valor) {
    setFormulario(atual => {
      const novoFormulario = { ...atual, [campo]: valor }

      if (campo === 'tipo') {
        return { ...novoFormulario, url: '' }
      }

      return novoFormulario
    })

    if (campo === 'tipo') {
      setArquivo(null)
    }
  }

  async function enviarArquivo() {
    if (!arquivo) return formulario.url

    const extensao = arquivo.name.split('.').pop()
    const nomeArquivo = `${Date.now()}-${crypto.randomUUID()}.${extensao}`
    const caminho = `${formulario.area}/${nomeArquivo}`

    const { error } = await supabase.storage
      .from('entregas')
      .upload(caminho, arquivo)

    if (error) {
      alert('Erro ao enviar arquivo: ' + error.message)
      return null
    }

    const { data } = supabase.storage
      .from('entregas')
      .getPublicUrl(caminho)

    return data.publicUrl
  }

  async function salvarEntrega(event) {
    event.preventDefault()

    if (!formulario.titulo.trim() || !formulario.autor_nome.trim()) {
      alert('Preencha o título e o nome de quem adicionou.')
      return
    }

    if (formulario.tipo === 'Link' && !formulario.url.trim()) {
      alert('Cole um link para enviar.')
      return
    }

    if (!editandoId && formulario.tipo !== 'Link' && !arquivo) {
      alert('Selecione um arquivo para enviar.')
      return
    }

    setEnviando(true)

    const urlFinal = formulario.tipo === 'Link'
      ? formulario.url.trim()
      : arquivo
        ? await enviarArquivo()
        : formulario.url

    if (!urlFinal) {
      setEnviando(false)
      return
    }

    const payload = {
      titulo: formulario.titulo.trim(),
      area: formulario.area,
      tipo: formulario.tipo,
      url: urlFinal,
      descricao: formulario.descricao.trim(),
      autor_nome: formulario.autor_nome.trim()
    }

    if (editandoId) {
      await supabase
        .from('trabalhos_entregues')
        .update(payload)
        .eq('id', editandoId)
    } else {
      await supabase
        .from('trabalhos_entregues')
        .insert([payload])
    }

    setFormulario(formularioInicial)
    setArquivo(null)
    setEditandoId(null)
    setEnviando(false)
    await carregarEntregas()
  }

  async function excluirEntrega(id) {
    if (!window.confirm('Deseja excluir este trabalho enviado?')) return

    await supabase
      .from('trabalhos_entregues')
      .delete()
      .eq('id', id)

    await carregarEntregas()
  }

  function cancelarEdicao() {
    setFormulario(formularioInicial)
    setArquivo(null)
    setEditandoId(null)
  }

  async function baixarArquivo(url, titulo) {
    try {
      const resposta = await fetch(url)
      const blob = await resposta.blob()

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = titulo || 'arquivo-entrega'
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(link.href)
    } catch  {
      alert('Não foi possível baixar o arquivo. Tente abrir e salvar manualmente.')
    }
  }

  function renderizarPreview(entrega) {
    if (entrega.tipo === 'Foto') {
      return (
        <img
          src={entrega.url}
          alt={entrega.titulo}
          className="delivery-preview-image"
        />
      )
    }

    if (entrega.tipo === 'Vídeo') {
      return (
        <video
          src={entrega.url}
          controls
          className="delivery-preview-video"
        />
      )
    }

    return null
  }

  return (
    <div>
      <div className="page-header">
        <h1>Entregas</h1>
      </div>

      <div className="area-grid">
        {AREAS.map(area => {
          const total = entregas.filter(entrega => entrega.area === area).length

          return (
            <div className="area-card" key={area}>
              <div className="area-card-content">
                <strong>{area}</strong>

                <div className="area-card-number">
                  {total}
                </div>

                <span>
                  {total === 1 ? 'trabalho entregue' : 'trabalhos entregues'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-title">
          <Upload size={22} />
          {editandoId ? 'Editar trabalho enviado' : 'Adicionar trabalho pronto'}
        </div>

        <form onSubmit={salvarEntrega}>
          <div className="form-grid deliveries-form-grid">
            <div className="form-group">
              <label>Título do trabalho</label>
              <input
                placeholder="Ex: Logo Cliente X"
                value={formulario.titulo}
                onChange={(e) => atualizarCampo('titulo', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Área</label>
              <select value={formulario.area} onChange={(e) => atualizarCampo('area', e.target.value)}>
                {AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>O que deseja enviar?</label>
              <select value={formulario.tipo} onChange={(e) => atualizarCampo('tipo', e.target.value)}>
                {TIPOS.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {formulario.tipo === 'Link' ? (
              <div className="form-group">
                <label>Link do trabalho</label>
                <input
                  placeholder="Cole o link do Drive, Canva, site, pasta ou arquivo"
                  value={formulario.url}
                  onChange={(e) => atualizarCampo('url', e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Enviar {formulario.tipo}</label>
                <label className="custom-file-upload">
  <input
    type="file"
    accept={
      formulario.tipo === 'Foto'
        ? 'image/*'
        : formulario.tipo === 'Vídeo'
          ? 'video/*'
          : '.pdf,.zip,.rar,.doc,.docx,.xls,.xlsx,.psd,.ai,.cdr'
    }
    onChange={(e) => setArquivo(e.target.files[0])}
  />

  <span>
    {arquivo
      ? arquivo.name
      : `Selecionar ${formulario.tipo}`}
  </span>
</label>

                {editandoId && formulario.url && !arquivo && (
                  <small className="file-selected">
                    Arquivo atual mantido. Escolha outro arquivo apenas se quiser substituir.
                  </small>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Nome de quem adicionou</label>
              <input
                placeholder="Nome do responsável"
                value={formulario.autor_nome}
                onChange={(e) => atualizarCampo('autor_nome', e.target.value)}
              />
            </div>

            <div className="form-group deliveries-description">
              <label>Descrição</label>
              <textarea
                placeholder="Explique o que é o trabalho, para qual cliente serve ou qualquer observação importante."
                value={formulario.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" type="submit" disabled={enviando}>
              <PlusCircle size={18} />
              {enviando
                ? 'Enviando...'
                : editandoId
                  ? 'Salvar alterações'
                  : 'Adicionar entrega'}
            </button>

            {editandoId && (
              <button className="btn-secondary" type="button" onClick={cancelarEdicao}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">
          <Search size={22} />
          Filtrar entregas
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Buscar</label>
            <input
              placeholder="Buscar por título, responsável, área, descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Área</label>
            <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="Todas">Todas as áreas</option>
              {AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="Todos">Todos os tipos</option>
              {TIPOS.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="deliveries-grid">
        {carregando ? (
          <div className="card empty-text">Carregando entregas...</div>
        ) : entregasFiltradas.length === 0 ? (
          <div className="card empty-text">Nenhuma entrega encontrada.</div>
        ) : (
          entregasFiltradas.map(entrega => (
            <div className="delivery-card" key={entrega.id}>
              <div className="delivery-card-header">
                <div>
                  <span className="delivery-area">{entrega.area}</span>
                  <h3>{entrega.titulo}</h3>
                </div>

                <span className="delivery-type">{entrega.tipo}</span>
              </div>

              {renderizarPreview(entrega)}

              <div className="delivery-description-box">
                <span>Descrição</span>
                <p>{entrega.descricao || 'Nenhuma descrição foi adicionada para esta entrega.'}</p>
              </div>

              <div className="delivery-meta">
                <span>Responsável</span>
                <strong>{entrega.autor_nome || 'Não informado'}</strong>
              </div>

              <div className="delivery-actions">
                <a
                  href={entrega.url}
                  target="_blank"
                  rel="noreferrer"
                  className="delivery-link"
                >
                  {entrega.tipo === 'Link'
                    ? 'Abrir Link'
                    : 'Visualizar'}
                </a>

                {entrega.tipo !== 'Link' && (
                  <button
                    type="button"
                    className="delivery-download"
                    onClick={() => baixarArquivo(entrega.url, entrega.titulo)}
                  >
                    Salvar
                  </button>
                )}

                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => excluirEntrega(entrega.id)}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}