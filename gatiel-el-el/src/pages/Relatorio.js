import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RELATÓRIO DE ADOÇÕES — Pessoa 3 (Refatorado)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Alterações em relação ao original:
 * 1. Agora exibe REQUERIMENTOS em vez de ADOÇÕES
 * 2. Exibe status: Pendente (amarelo), Aceito (verde), Recusado (vermelho)
 * 3. Adicionado filtro por STATUS
 * 4. Adicionado filtro por ESPÉCIE do pet
 * 5. Adicionado filtro por DATA (intervalo)
 * 6. Exibe badge colorida conforme o status
 */

function Relatorio() {
  // ── Estados para dados ──
  const [requerimentos, setRequerimentos] = useState([]);
  const [pets, setPets]                   = useState([]);
  const [carregando, setCarregando]       = useState(true);

  // ── Estados para filtros ──
  const [filtroStatus, setFiltroStatus]       = useState(''); // vazio = todos
  const [filtroEspecie, setFiltroEspecie]     = useState(''); // vazio = todos
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim]       = useState('');

  // ── useEffect: Carrega os dados ao abrir a página ──
  useEffect(() => {
    async function carregarDados() {
      try {
        // 📍 Busca requerimentos
        const snapReq = await getDocs(collection(db, 'requerimentos'));
        const reqs = snapReq.docs.map(d => ({ id: d.id, ...d.data() }));
        setRequerimentos(reqs);

        // 📍 Busca pets (para ter informações completas, se necessário)
        const snapPets = await getDocs(collection(db, 'pets'));
        const pts = snapPets.docs.map(d => ({ id: d.id, ...d.data() }));
        setPets(pts);

        setCarregando(false);
      } catch (erro) {
        console.error('Erro ao carregar relatório:', erro);
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // ── Helper: Formata data ISO para PT-BR ──
  function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  // ── Helper: Converte data PT-BR para ISO (YYYY-MM-DD) ──
  function formatarDataParaISO(dataPTBR) {
    if (!dataPTBR) return null;
    const [dia, mes, ano] = dataPTBR.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  // ── Helper: Badge e cor conforme status ──
  function badgeStatus(status) {
    if (status === 'Pendente')  return { classe: 'bg-warning text-dark', icone: '⏳' };
    if (status === 'Aceito')    return { classe: 'bg-success', icone: '✅' };
    if (status === 'Recusado')  return { classe: 'bg-danger', icone: '❌' };
    return { classe: 'bg-secondary', icone: '?' };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LÓGICA DE FILTRO
  // ═══════════════════════════════════════════════════════════════════════════════

  const dadosFiltrados = requerimentos.filter(req => {
    // Filtro por STATUS
    if (filtroStatus && req.status !== filtroStatus) {
      return false;
    }

    // Filtro por ESPÉCIE
    if (filtroEspecie && req.petEspecie !== filtroEspecie) {
      return false;
    }

    // Filtro por DATA (intervalo)
    if (filtroDataInicio || filtroDataFim) {
      const dataReq = req.dataEnvio ? req.dataEnvio.split('T')[0] : null;
      
      if (filtroDataInicio && dataReq < filtroDataInicio) {
        return false;
      }
      
      if (filtroDataFim && dataReq > filtroDataFim) {
        return false;
      }
    }

    return true;
  });

  // ── Extrai as espécies únicas para o dropdown de filtro ──
  const especiesUnicas = [...new Set(requerimentos.map(r => r.petEspecie))].sort();

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════════

  if (carregando) {
    return <div className="text-center mt-5"><div className="spinner-border text-warning"></div></div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#e8973c22 0%,#fff8f0 100%)',
        borderLeft: '4px solid #e8973c',
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 24
      }}>
        <h2 style={{ color: '#e8973c', margin: 0 }}>📊 Relatório de Adoções</h2>
        <p className="text-muted mb-0 mt-1">Histórico completo de solicitações: pendentes, aceitas e recusadas.</p>
      </div>

      {/* FILTROS */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <h6 className="fw-bold mb-3">🔍 Filtros</h6>
        
        <div className="row g-3">
          {/* Filtro por Status */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Status</label>
            <select
              className="form-select form-select-sm"
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Pendente">⏳ Pendente</option>
              <option value="Aceito">✅ Aceito</option>
              <option value="Recusado">❌ Recusado</option>
            </select>
          </div>

          {/* Filtro por Espécie */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Espécie</label>
            <select
              className="form-select form-select-sm"
              value={filtroEspecie}
              onChange={e => setFiltroEspecie(e.target.value)}
            >
              <option value="">Todas as espécies</option>
              {especiesUnicas.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Data Inicial */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Data de início</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtroDataInicio}
              onChange={e => setFiltroDataInicio(e.target.value)}
            />
          </div>

          {/* Filtro por Data Final */}
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Data final</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtroDataFim}
              onChange={e => setFiltroDataFim(e.target.value)}
            />
          </div>
        </div>

        {/* Botão para limpar filtros */}
        {(filtroStatus || filtroEspecie || filtroDataInicio || filtroDataFim) && (
          <button
            className="btn btn-sm btn-outline-secondary mt-3"
            onClick={() => {
              setFiltroStatus('');
              setFiltroEspecie('');
              setFiltroDataInicio('');
              setFiltroDataFim('');
            }}
          >
            🔄 Limpar filtros
          </button>
        )}
      </div>

      {/* TABELA DE REQUERIMENTOS */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom">
          <span className="fw-semibold">
            {dadosFiltrados.length} requerimento(s) encontrado(s)
          </span>
        </div>

        {dadosFiltrados.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">Nenhum requerimento com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Solicitante</th>
                  <th>Pet</th>
                  <th>Espécie</th>
                  <th>Data da solicitação</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map(req => {
                  const badge = badgeStatus(req.status);
                  return (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.usuarioNome}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#e8973c' }}>🐾 {req.petNome}</strong>
                      </td>
                      <td>
                        {req.petEspecie}
                      </td>
                      <td>
                        <small>{formatarData(req.dataEnvio)}</small>
                      </td>
                      <td>
                        <span className={`badge ${badge.classe}`}>
                          {badge.icone} {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESUMO ESTATÍSTICO */}
      <div className="row g-3 mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body text-center">
              <div style={{ fontSize: '2rem' }}>⏳</div>
              <h6 className="fw-bold mt-2">Pendentes</h6>
              <p className="mb-0 fs-5 fw-bold text-warning">
                {requerimentos.filter(r => r.status === 'Pendente').length}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body text-center">
              <div style={{ fontSize: '2rem' }}>✅</div>
              <h6 className="fw-bold mt-2">Aceitas</h6>
              <p className="mb-0 fs-5 fw-bold text-success">
                {requerimentos.filter(r => r.status === 'Aceito').length}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-light">
            <div className="card-body text-center">
              <div style={{ fontSize: '2rem' }}>❌</div>
              <h6 className="fw-bold mt-2">Recusadas</h6>
              <p className="mb-0 fs-5 fw-bold text-danger">
                {requerimentos.filter(r => r.status === 'Recusado').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorio;