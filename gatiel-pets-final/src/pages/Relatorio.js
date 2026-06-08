import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Relatorio() {
  const [requerimentos, setRequerimentos] = useState([]);
  const [carregando, setCarregando]       = useState(true);
  const [filtroStatus, setFiltroStatus]   = useState('Todos');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');

  useEffect(() => {
    async function carregar() {
      const snapshot = await getDocs(collection(db, 'requerimentos'));
      const lista = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
      setRequerimentos(lista);
      setCarregando(false);
    }
    carregar();
  }, []);

  function badgeStatus(s) {
    if (s === 'Aceito')   return 'badge rounded-pill bg-success';
    if (s === 'Recusado') return 'badge rounded-pill bg-danger';
    return 'badge rounded-pill bg-warning text-dark';
  }

  function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  const especies = ['Todos', ...new Set(requerimentos.map(r => r.petEspecie).filter(Boolean))];

  const filtrados = requerimentos
    .filter(r => filtroStatus  === 'Todos' || r.status     === filtroStatus)
    .filter(r => filtroEspecie === 'Todos' || r.petEspecie === filtroEspecie);

  const total    = filtrados.length;
  const aceitos  = filtrados.filter(r => r.status === 'Aceito').length;
  const recusados= filtrados.filter(r => r.status === 'Recusado').length;
  const pendentes= filtrados.filter(r => r.status === 'Pendente').length;

  return (
    <div style={{ fontFamily: "'Baloo', cursive" }}>

      {/* Cabeçalho */}
      <div style={{
        background: 'linear-gradient(135deg, #e8973c22 0%, #fff8f0 100%)',
        borderLeft: '4px solid #e8973c',
        borderRadius: 8, padding: '20px 24px', marginBottom: 24,
      }}>
        <h2 style={{ color: '#e8973c', margin: 0 }}>📊 Relatório de Requerimentos</h2>
        <p className="text-muted mb-0 mt-1">Visão geral de todas as solicitações de adoção.</p>
      </div>

      {/* Cards de resumo */}
      {!carregando && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Total',     valor: total,     cor: '#e8973c', icone: '📋' },
            { label: 'Pendentes', valor: pendentes,  cor: '#ffc107', icone: '⏳' },
            { label: 'Aceitos',   valor: aceitos,    cor: '#198754', icone: '✅' },
            { label: 'Recusados', valor: recusados,  cor: '#dc3545', icone: '❌' },
          ].map(c => (
            <div className="col-6 col-md-3" key={c.label}>
              <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: 12, borderTop: `4px solid ${c.cor}` }}>
                <div style={{ fontSize: '1.8rem' }}>{c.icone}</div>
                <h3 className="fw-bold mb-0" style={{ color: c.cor }}>{c.valor}</h3>
                <small className="text-muted">{c.label}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 12 }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-semibold small">Filtrar por status</label>
            <select className="form-select" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="Todos">Todos os status</option>
              <option value="Pendente">⏳ Pendente</option>
              <option value="Aceito">✅ Aceito</option>
              <option value="Recusado">❌ Recusado</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold small">Filtrar por espécie</label>
            <select className="form-select" value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}>
              {especies.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <button className="btn btn-outline-secondary w-100"
              onClick={() => { setFiltroStatus('Todos'); setFiltroEspecie('Todos'); }}>
              🔄 Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ color: '#e8973c', margin: 0 }}>Lista de Requerimentos</h5>
          <span className="badge rounded-pill" style={{ backgroundColor: '#e8973c' }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {carregando ? (
          <div className="text-center py-4">
            <div className="spinner-border" style={{ color: '#e8973c' }} />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-4">
            <div style={{ fontSize: '2.5rem' }}>📭</div>
            <p className="text-muted mt-2">Nenhum resultado encontrado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#e8973c', color: '#fff' }}>
                <tr>
                  <th>Solicitante</th>
                  <th>Pet</th>
                  <th>Espécie</th>
                  <th>Mensagem</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(r => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.usuarioNome}</td>
                    <td>{r.petNome}</td>
                    <td>{r.petEspecie}</td>
                    <td className="text-muted small" style={{ maxWidth: 200 }}>
                      {r.mensagem || <span className="text-muted">—</span>}
                    </td>
                    <td>{formatarData(r.dataEnvio)}</td>
                    <td><span className={badgeStatus(r.status)}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Relatorio;
