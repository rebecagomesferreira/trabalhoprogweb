import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

function Requerimentos() {
  const [requerimentos, setRequerimentos] = useState([]);
  const [carregando, setCarregando]       = useState(true);
  const [filtro, setFiltro]               = useState('Pendente');

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const snapshot = await getDocs(collection(db, 'requerimentos'));
    const lista = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
    setRequerimentos(lista);
    setCarregando(false);
  }

  async function handleAceitar(req) {
    if (!window.confirm(`Aceitar a solicitação de ${req.usuarioNome} para adotar ${req.petNome}?`)) return;
    // Atualiza o requerimento para Aceito
    await updateDoc(doc(db, 'requerimentos', req.id), { status: 'Aceito' });
    // Atualiza o pet para Adotado
    await updateDoc(doc(db, 'pets', req.petId), { status: 'Adotado' });
    setRequerimentos(prev =>
      prev.map(r => r.id === req.id ? { ...r, status: 'Aceito' } : r)
    );
  }

  async function handleRecusar(req) {
    if (!window.confirm(`Recusar a solicitação de ${req.usuarioNome}?`)) return;
    // Atualiza apenas o requerimento — pet continua disponível
    await updateDoc(doc(db, 'requerimentos', req.id), { status: 'Recusado' });
    setRequerimentos(prev =>
      prev.map(r => r.id === req.id ? { ...r, status: 'Recusado' } : r)
    );
  }

  function badgeStatus(s) {
    if (s === 'Aceito')   return 'badge rounded-pill bg-success';
    if (s === 'Recusado') return 'badge rounded-pill bg-danger';
    return 'badge rounded-pill bg-warning text-dark';
  }

  function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
  }

  const filtrados = filtro === 'Todos'
    ? requerimentos
    : requerimentos.filter(r => r.status === filtro);

  const totalPendente = requerimentos.filter(r => r.status === 'Pendente').length;

  return (
    <div style={{ fontFamily: "'Baloo', cursive" }}>

      {/* Cabeçalho */}
      <div style={{
        background: 'linear-gradient(135deg, #e8973c22 0%, #fff8f0 100%)',
        borderLeft: '4px solid #e8973c',
        borderRadius: 8, padding: '20px 24px', marginBottom: 24,
      }}>
        <h2 style={{ color: '#e8973c', margin: 0 }}>
          📬 Requerimentos de Adoção
          {totalPendente > 0 && (
            <span className="badge ms-2 text-white" style={{ backgroundColor: '#e8973c', fontSize: '0.7rem', verticalAlign: 'middle' }}>
              {totalPendente} pendente{totalPendente > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <p className="text-muted mb-0 mt-1">
          Analise as solicitações enviadas pelos usuários e aceite ou recuse cada uma.
        </p>
      </div>

      {/* Filtros */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['Pendente', 'Aceito', 'Recusado', 'Todos'].map(f => (
          <button key={f}
            className={`btn btn-sm fw-semibold ${filtro === f ? 'text-white' : 'btn-outline-secondary'}`}
            style={filtro === f ? { backgroundColor: '#e8973c', border: 'none' } : {}}
            onClick={() => setFiltro(f)}>
            {f === 'Pendente' && `⏳ Pendente${totalPendente > 0 ? ` (${totalPendente})` : ''}`}
            {f === 'Aceito'   && '✅ Aceitos'}
            {f === 'Recusado' && '❌ Recusados'}
            {f === 'Todos'    && '📋 Todos'}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#e8973c' }} />
          <p className="text-muted mt-2">Carregando requerimentos...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-5 card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div style={{ fontSize: '3rem' }}>📭</div>
          <p className="text-muted mt-2 fw-semibold">Nenhum requerimento {filtro !== 'Todos' ? filtro.toLowerCase() : ''} encontrado.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtrados.map(req => (
            <div key={req.id} className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

                {/* Informações */}
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={badgeStatus(req.status)} style={{ fontSize: '0.85rem' }}>
                      {req.status}
                    </span>
                    <span className="text-muted small">📅 {formatarData(req.dataEnvio)}</span>
                  </div>
                  <h6 className="fw-bold mb-1">
                    👤 {req.usuarioNome}
                    <span className="text-muted fw-normal small ms-2">quer adotar</span>
                    🐾 {req.petNome}
                    <span className="text-muted fw-normal small ms-1">({req.petEspecie})</span>
                  </h6>
                  {req.mensagem && (
                    <p className="text-secondary small mb-0" style={{ fontStyle: 'italic' }}>
                      💬 "{req.mensagem}"
                    </p>
                  )}
                </div>

                {/* Botões — só aparecem se ainda Pendente */}
                {req.status === 'Pendente' && (
                  <div className="d-flex gap-2 align-self-center">
                    <button className="btn btn-success fw-semibold"
                      onClick={() => handleAceitar(req)}>
                      ✅ Aceitar
                    </button>
                    <button className="btn btn-danger fw-semibold"
                      onClick={() => handleRecusar(req)}>
                      ❌ Recusar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requerimentos;
