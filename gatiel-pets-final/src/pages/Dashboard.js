import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Dashboard() {
  const { usuario } = useAuth();
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    async function contar() {
      const q = query(collection(db, 'requerimentos'), where('status', '==', 'Pendente'));
      const snap = await getDocs(q);
      setPendentes(snap.size);
    }
    contar();
  }, []);

  const cards = [
    { icon: '👤', titulo: 'Usuários',        desc: 'Gerencie os cadastros de usuários',     link: '/admin/usuarios',      cor: '#4e73df', badge: null },
    { icon: '🐶', titulo: 'Pets',            desc: 'Cadastre e edite os pets disponíveis',  link: '/admin/pets',           cor: '#e8973c', badge: null },
    { icon: '📋', titulo: 'Adoções',         desc: 'Acompanhe as adoções realizadas',       link: '/admin/adocoes',        cor: '#1cc88a', badge: null },
    { icon: '📬', titulo: 'Requerimentos',   desc: 'Solicitações enviadas pelos usuários',  link: '/admin/requerimentos',  cor: '#e8973c', badge: pendentes },
    { icon: '📊', titulo: 'Relatório',       desc: 'Veja relatórios e estatísticas',        link: '/admin/relatorio',      cor: '#36b9cc', badge: null },
  ];

  return (
    <div style={{ fontFamily: "'Baloo', cursive" }}>
      <div style={{
        background: 'linear-gradient(135deg, #e8973c22 0%, #fff8f0 100%)',
        borderLeft: '4px solid #e8973c', borderRadius: 8,
        padding: '20px 24px', marginBottom: 32,
      }}>
        <h2 style={{ color: '#e8973c', margin: 0 }}>🐾 Painel Administrativo</h2>
        <p className="text-muted mb-0 mt-1">
          Bem-vindo, <strong>{usuario?.nome}</strong>! Escolha uma seção para gerenciar.
        </p>
      </div>

      <div className="row g-4">
        {cards.map(card => (
          <div className="col-md-4 col-sm-6" key={card.link}>
            <div className="card text-center border-0 shadow-sm h-100 position-relative"
              style={{ borderRadius: 12, transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

              {card.badge > 0 && (
                <span className="position-absolute top-0 end-0 m-2 badge rounded-pill bg-danger"
                  style={{ fontSize: '0.75rem' }}>
                  {card.badge} pendente{card.badge > 1 ? 's' : ''}
                </span>
              )}

              <div className="card-body p-4 d-flex flex-column align-items-center">
                <div style={{
                  fontSize: '2.8rem', backgroundColor: card.cor + '18',
                  borderRadius: '50%', width: 80, height: 80,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  {card.icon}
                </div>
                <h5 className="fw-bold mb-1">{card.titulo}</h5>
                <p className="text-muted small mb-3">{card.desc}</p>
                <Link to={card.link} className="btn mt-auto text-white fw-semibold"
                  style={{ backgroundColor: '#e8973c', borderRadius: 8, minWidth: 120 }}>
                  Acessar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
