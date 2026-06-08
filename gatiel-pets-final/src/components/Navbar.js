import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    async function contarPendentes() {
      const q = query(collection(db, 'requerimentos'), where('status', '==', 'Pendente'));
      const snap = await getDocs(q);
      setPendentes(snap.size);
    }
    contarPendentes();
  }, [location.pathname]); // Atualiza ao mudar de página

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

        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/admin"
          style={{ color: '#e8973c', fontSize: '1.3rem' }}>
          🐾 Gatiel Pets
          <span className="badge text-white ms-1"
            style={{ backgroundColor: '#e8973c', fontSize: '0.6rem', borderRadius: 6 }}>
            ADMIN
          </span>
        </Link>

        <div className="d-none d-lg-flex gap-3 align-items-center">
          <Link className="nav-link px-1" to="/admin"                style={ativo('/admin')}>🏠 Início</Link>
          <Link className="nav-link px-1" to="/admin/usuarios"       style={ativo('/admin/usuarios')}>👤 Usuários</Link>
          <Link className="nav-link px-1" to="/admin/pets"           style={ativo('/admin/pets')}>🐶 Pets</Link>
          <Link className="nav-link px-1" to="/admin/adocoes"        style={ativo('/admin/adocoes')}>📋 Adoções</Link>
          <Link className="nav-link px-1 position-relative" to="/admin/requerimentos" style={ativo('/admin/requerimentos')}>
            📬 Requerimentos
            {pendentes > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.6rem' }}>
                {pendentes}
              </span>
            )}
          </Link>
          <Link className="nav-link px-1" to="/admin/relatorio"      style={ativo('/admin/relatorio')}>📊 Relatório</Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            Olá, <strong style={{ color: '#e8973c' }}>{usuario?.nome}</strong>
          </span>
          <button className="btn btn-outline-danger btn-sm fw-semibold" onClick={handleLogout}>Sair</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
