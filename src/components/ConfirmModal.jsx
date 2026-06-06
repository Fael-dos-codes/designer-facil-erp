export default function ConfirmModal({
  aberto,
  titulo,
  mensagem,
  textoConfirmar,
  textoCancelar,
  aoConfirmar,
  aoCancelar
}) {

  if (!aberto) {
    return null
  }

  return (
    <div className="modal-overlay">

      <div className="modal-card">

        <h2>{titulo}</h2>

        <p>{mensagem}</p>

        <div className="modal-actions">

          <button
            className="btn-secondary"
            onClick={aoCancelar}
          >
            {textoCancelar || 'Cancelar'}
          </button>

          <button
            className="btn-delete"
            onClick={aoConfirmar}
          >
            {textoConfirmar || 'Confirmar'}
          </button>

        </div>

      </div>

    </div>
  )
}