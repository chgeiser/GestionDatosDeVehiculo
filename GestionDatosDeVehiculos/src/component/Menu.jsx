import { Navbar, Nav, Container } from "react-bootstrap";
import {  NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Menu =  ({ menu }) => {

const estiloActivo = ({isActive}) => `text-${isActive ? "warning" : "primary" } ms-3 text-decoration-none`;

  return (
    <>
      <Navbar expand="lg" bg="light">
        <Container fluid>
          <Navbar.Toggle aria-controls="navbarNavAltMarkup" />
          <Navbar.Collapse id="navbarNavAltMarkup">
            <Nav className="me-auto">
              <Navbar.Brand>Info Vehiculos</Navbar.Brand>
              {menu.map((item) => (
                <NavLink 
                key={item.nombre} 
                to={item.link}
                className = {estiloActivo}>
                  {item.nombre}                 
                </NavLink>
              ))}
            </Nav>
           <form className="d-flex" role="search">            
          <button type="button"> </button>
          </form>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default Menu