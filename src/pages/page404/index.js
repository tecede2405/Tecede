import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center text-center" >
          <Col md={8}>
            <div className="p-5 shadow-lg bg-white rounded-4">
              
              <FaExclamationTriangle 
                size={80} 
                className="text-warning mb-4" 
              />

              <h1 className="display-1 fw-bold text-danger">404</h1>

              <h3 className="mb-3">Trang đang cập nhật</h3>

              <p className="text-muted mb-4">
                Xin lỗi, trang bạn đang tìm kiếm đang cập nhật.
              </p>

              <Link to="/">
                <Button variant="primary" size="lg" className="px-4">
                  Quay về Trang Chủ
                </Button>
              </Link>

            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
