import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

function MeusPedidos() {
  const [pedidos, setPedidos]       = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    async function carregar() {
      const q = query(collection(db, 'requerimentos'), where('usuarioId', '==', usuario.id));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
      setPedidos(lista);
      setCarregando(false);
    }
    carregar();
  }, [usuario.id]);

  function badgeStatus(s) {
    if (s === 'Aceito')   return 'badge rounded-pill bg-success';
    if (s === 'Recusado') return 'badge rounded-pill bg-danger';
    return 'badge rounded-pill bg-warning text-dark';
  }

  function iconeStatus(s) {
    if (s === 'Aceito')   return '✅';
    if (s === 'Recusado') return '❌';
    return '⏳';
  }

  function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#e8973c22 0%,#fff8f0 100%)', borderLeft:'4px solid #e8973c', borderRadius:8, padding:'20px 24px', marginBottom:24 }}>
        <h2 style={{ color:'#e8973c', margin:0 }}>📋 Meus pedidos de adoção</h2>
        <p className="text-muted mb-0 mt-1">Acompanhe o status das suas solicitações enviadas ao administrador.</p>
      </div>

      {carregando ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color:'#e8973c' }} />
          <p className="text-muted mt-2">Carregando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-5 card border-0 shadow-sm" style={{ borderRadius:12 }}>
          <div style={{ fontSize:'3rem' }}>📭</div>
          <p className="text-muted mt-2 fw-semibold">Você ainda não fez nenhuma solicitação.</p>
          <p className="text-muted small">Acesse <strong>Pets disponíveis</strong> e solicite a adoção do seu novo amigo!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pedidos.map(p => (
            <div key={p.id} className="card border-0 shadow-sm p-4" style={{ borderRadius:12 }}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h6 className="fw-bold mb-1">
                    🐾 {p.petNome}
                    <span className="text-muted fw-normal small ms-2">({p.petEspecie})</span>
                  </h6>
                  <p className="text-muted small mb-1">📅 Enviado em {formatarData(p.dataEnvio)}</p>
                  {p.mensagem && (
                    <p className="text-secondary small mb-0" style={{ fontStyle:'italic' }}>
                      💬 "{p.mensagem}"
                    </p>
                  )}
                </div>
                <div className="text-end">
                  <span className={badgeStatus(p.status)} style={{ fontSize:'0.9rem', padding:'6px 14px' }}>
                    {iconeStatus(p.status)} {p.status}
                  </span>
                  {p.status === 'Aceito' && (
                    <p className="text-success small mt-2 mb-0">🎉 Parabéns! Entre em contato com o abrigo.</p>
                  )}
                  {p.status === 'Recusado' && (
                    <p className="text-muted small mt-2 mb-0">Não desanime, outros pets esperam por você!</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeusPedidos;
