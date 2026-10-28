import { Container, Row, Col } from 'react-bootstrap'
import { Outlet } from 'react-router-dom'
import MenuAdmin from '../../components/MenuAdmin.jsx'

function PanelAdmin() {
  return (
    <Container fluid="xl" as="section" className="py-4">
      <Row className="g-4">
        <Col lg={3} xl={2}>
          <MenuAdmin />
        </Col>
        <Col lg={9} xl={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  )
}

export default PanelAdmin
