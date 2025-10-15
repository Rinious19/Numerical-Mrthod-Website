import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavbarComponent() {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm fixed-top">
        {/* Navbar Brand → ไปหน้า Home */}
        <Navbar.Brand as={Link} to="/" className="fw-bold ms-4">
          ꧁ঔৣ 𝒦𝒶𝓇𝒾𝓃 ঔৣ꧂ 
        </Navbar.Brand>
    </Navbar>
  );
}

export default NavbarComponent;
