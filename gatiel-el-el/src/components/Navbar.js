import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * NAVBAR DO ADMIN — Pessoa 3
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Mudanças em relação ao original:
 * 1. Adicionado badge com contador de requerimentos PENDENTES
 * 2. Badge aparece ao lado do link "Requerimentos"
 * 3. Badge atualiza em tempo real quando a página abre
 * 4. Badge desaparece quando não há requerimentos pendentes
 */

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState(0);

  // ── Carrega a contagem de requerimentos pendentes ──
  useEffect(() => {
    async function contar() {
      try {
        // 📍 Query que busca APENAS requerimentos com status === 'Pendente'
        const q = query(
          collection(db, 'requerimentos'),
          where('status', '==', 'Pendente')
        );
        const snapshot = await getDocs(q);
        setPendentes(snapshot.size); // size = quantidade de documentos
      } catch (err) {
        console.error('Erro ao contar requerimentos pendentes:', err);
      }
    }
    contar();
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        {/* Logo/Título */}
        <Link className="navbar-brand fw-bold" to="/admin" style={{ color: '#e8973c' }}>
          🐾 Gatiel Pets
        </Link>

        {/* Menu (coluna para desktop, hamburger para mobile) */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-auto d-flex gap-3 align-items-center">
            {/* Links de navegação */}
            <Link className="nav-link" to="/admin">Início</Link>
            <Link className="nav-link" to="/admin/usuarios">Usuários</Link>
            <Link className="nav-link" to="/admin/pets">Pets</Link>
            
            {/* ✨ REQUERIMENTOS COM BADGE ✨ */}
            {/* 
              Este é o elemento mais importante da Pessoa 3:
              Um link para a página de requerimentos com uma badge mostrando
              quantos requerimentos estão pendentes
            */}
            <Link className="nav-link position-relative" to="/admin/requerimentos">
              Requerimentos
              {pendentes > 0 && (
                <span className="badge position-absolute top-0 start-100 translate-middle bg-danger">
                  {pendentes}
                  <span className="visually-hidden">requerimentos pendentes</span>
                </span>
              )}
            </Link>

            <Link className="nav-link" to="/admin/relatorio">Relatório</Link>

            {/* Informações do usuário logado */}
            <span className="text-muted small">
              Olá, <strong style={{ color: '#e8973c' }}>{usuario?.nome}</strong>
            </span>

            {/* Botão de logout */}
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;