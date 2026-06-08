import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavbarUsuario() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() { logout(); navigate('/login'); }

  function ativo(path) {
    return location.pathname === path
      ? { color: '#e8973c', fontWeight: '700', borderBottom: '3px solid #e8973c', paddingBottom: 2 }
      : { color: '#555' };
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white"
      style={{ boxShadow: '0 8px 15px rgba(123,122,122,0.15)', fontFamily: "'Baloo', cursive" }}>
      <div className="container justify-content-between">

        <Link className="navbar-brand fw-bold" to="/user/pets"
          style={{ color: '#e8973c', fontSize: '1.3rem' }}>
          🐾 Gatiel Pets
        </Link>

        <div className="d-none d-lg-flex gap-4 align-items-center">
          <Link className="nav-link px-1" to="/user/pets"         style={ativo('/user/pets')}>🐶 Pets disponíveis</Link>
          <Link className="nav-link px-1" to="/user/meus-pedidos" style={ativo('/user/meus-pedidos')}>📋 Meus pedidos</Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            Olá, <strong style={{ color: '#e8973c' }}>{usuario?.nome}</strong>
          </span>
          <button className="btn btn-outline-danger btn-sm fw-semibold" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavbarUsuario;
