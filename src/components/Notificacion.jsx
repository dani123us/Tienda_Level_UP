import { Toast, ToastContainer } from 'react-bootstrap'

function Notificacion({ aviso, onCerrar }) {
  return (
    <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 1080 }}>
      <Toast
        show={Boolean(aviso)}
        onClose={onCerrar}
        delay={2500}
        autohide
        bg={aviso?.tipo === 'error' ? 'danger' : 'dark'}
        className="border border-secondary"
      >
        <Toast.Header closeButton>
          <strong className="me-auto">Level-Up Gamer</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{aviso?.mensaje}</Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

export default Notificacion
