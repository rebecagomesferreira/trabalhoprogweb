import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PÁGINA DE REQUERIMENTOS — Pessoa 3
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Esta página permite que o administrador:
 * 1. Veja TODOS os requerimentos pendentes de adoção
 * 2. Aceite ou recuse cada solicitação
 * 3. Quando aceita: marca requerimento como "Aceito" E o pet como "Adotado"
 * 4. Quando recusa: marca apenas o requerimento como "Recusado"
 * 
 * Fluxo de dados:
 *   Firebase (requerimentos) → Estado React → Tabela → Botões → Atualiza Firebase
 */

function Requerimentos() {
  // ── Estados para armazenar os dados ──
  const [requerimentos, setRequerimentos] = useState([]);
  const [carregando, setCarregando]       = useState(true);
  const [processando, setProcessando]     = useState(null); // ID do requerimento sendo processado
  const [erro, setErro]                   = useState('');
  const [sucesso, setSucesso]             = useState('');

  // ── useEffect: Carrega requerimentos ao abrir a página ──
  // [] = roda UMA VEZ quando o componente monta
  useEffect(() => {
    async function carregar() {
      try {
        // 📍 Busca TODOS os requerimentos (pendentes, aceitos, recusados)
        // Será filtrado por status na exibição
        const snapshot = await getDocs(collection(db, 'requerimentos'));
        const lista = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          // Ordena por data de envio (mais recentes primeiro)
          .sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
        
        setRequerimentos(lista);
        setCarregando(false);
      } catch (err) {
        setErro('Erro ao carregar requerimentos.');
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // ── Função para ACEITAR a adoção ──
  async function handleAceitar(requerimento) {
    setProcessando(requerimento.id);
    try {
      // 1️⃣ Atualiza o requerimento para "Aceito"
      await updateDoc(doc(db, 'requerimentos', requerimento.id), {
        status: 'Aceito'
      });

      // 2️⃣ Atualiza o pet para "Adotado"
      await updateDoc(doc(db, 'pets', requerimento.petId), {
        status: 'Adotado'
      });

      // 3️⃣ Atualiza o estado local (sem precisar recarregar a página)
      setRequerimentos(
        requerimentos.map(r => 
          r.id === requerimento.id ? { ...r, status: 'Aceito' } : r
        )
      );

      setSucesso(`✅ Adoção de ${requerimento.petNome} aceita!`);
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      setErro('Erro ao aceitar a adoção. Tente novamente.');
    } finally {
      setProcessando(null);
    }
  }

  // ── Função para RECUSAR a adoção ──
  async function handleRecusar(requerimento) {
    if (!window.confirm(`Tem certeza que deseja recusar esta solicitação?`)) return;

    setProcessando(requerimento.id);
    try {
      // 1️⃣ Atualiza APENAS o requerimento para "Recusado"
      // O pet continua com status "Disponível"
      await updateDoc(doc(db, 'requerimentos', requerimento.id), {
        status: 'Recusado'
      });

      // 2️⃣ Atualiza o estado local
      setRequerimentos(
        requerimentos.map(r => 
          r.id === requerimento.id ? { ...r, status: 'Recusado' } : r
        )
      );

      setSucesso(`❌ Solicitação de ${requerimento.petNome} recusada.`);
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      setErro('Erro ao recusar a adoção. Tente novamente.');
    } finally {
      setProcessando(null);
    }
  }

  // ── Helper: Formata data ISO para PT-BR ──
  function formatarData(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  // ── Helper: Retorna classe CSS e ícone conforme o status ──
  function badgeStatus(status) {
    if (status === 'Pendente')  return { classe: 'bg-warning text-dark', icone: '⏳' };
    if (status === 'Aceito')    return { classe: 'bg-success', icone: '✅' };
    if (status === 'Recusado')  return { classe: 'bg-danger', icone: '❌' };
  }

  // ── Filtra apenas os requerimentos PENDENTES para exibir na tabela ──
  const pendentes = requerimentos.filter(r => r.status === 'Pendente');

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div>
      {/* Header com título e descrição */}
      <div style={{
        background: 'linear-gradient(135deg,#e8973c22 0%,#fff8f0 100%)',
        borderLeft: '4px solid #e8973c',
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 24
      }}>
        <h2 style={{ color: '#e8973c', margin: 0 }}>📋 Requerimentos de Adoção</h2>
        <p className="text-muted mb-0 mt-1">
          {pendentes.length === 0 
            ? 'Nenhum requerimento pendente no momento.' 
            : `${pendentes.length} solicitação(ões) aguardando sua análise.`}
        </p>
      </div>

      {/* Mensagens de feedback */}
      {erro && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {erro}
        <button type="button" className="btn-close" onClick={() => setErro('')}></button>
      </div>}
      {sucesso && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {sucesso}
        <button type="button" className="btn-close" onClick={() => setSucesso('')}></button>
      </div>}

      {/* Indicador de carregamento */}
      {carregando ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#e8973c' }}></div>
          <p className="text-muted mt-2">Carregando requerimentos...</p>
        </div>
      ) : pendentes.length === 0 ? (
        /* Sem requerimentos pendentes */
        <div className="text-center py-5 card border-0 shadow-sm">
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <p className="text-muted mt-2 fw-semibold">Parabéns! Todos os requerimentos foram processados.</p>
          <p className="text-muted small">Consulte o relatório para ver o histórico completo.</p>
        </div>
      ) : (
        /* Tabela de requerimentos pendentes */
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-warning">
                <tr>
                  <th>Solicitante</th>
                  <th>Pet desejado</th>
                  <th>Espécie</th>
                  <th>Data da solicitação</th>
                  <th>Mensagem</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map(req => (
                  <tr key={req.id}>
                    {/* Nome do solicitante */}
                    <td>
                      <strong>{req.usuarioNome}</strong>
                      <br />
                      <small className="text-muted">{req.usuarioId}</small>
                    </td>

                    {/* Nome do pet */}
                    <td>
                      <strong style={{ color: '#e8973c' }}>🐾 {req.petNome}</strong>
                    </td>

                    {/* Espécie do pet */}
                    <td>{req.petEspecie}</td>

                    {/* Data formatada */}
                    <td>
                      <small>{formatarData(req.dataEnvio)}</small>
                    </td>

                    {/* Mensagem (se houver) */}
                    <td>
                      {req.mensagem ? (
                        <small style={{ fontStyle: 'italic', color: '#666' }}>
                          "{req.mensagem.substring(0, 50)}{req.mensagem.length > 50 ? '...' : ''}"
                        </small>
                      ) : (
                        <small className="text-muted">Sem mensagem</small>
                      )}
                    </td>

                    {/* Botões de ação */}
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleAceitar(req)}
                        disabled={processando === req.id}
                        title="Aceitar e marcar o pet como Adotado"
                      >
                        {processando === req.id ? '⏳' : '✅'} Aceitar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRecusar(req)}
                        disabled={processando === req.id}
                        title="Recusar (pet continua disponível)"
                      >
                        {processando === req.id ? '⏳' : '❌'} Recusar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seção informativa */}
      <div className="card mt-4 border-info bg-light">
        <div className="card-body">
          <h6 className="card-title fw-bold">💡 Como funciona?</h6>
          <ul className="small mb-0">
            <li><strong>Aceitar:</strong> Marca o requerimento como "Aceito" e o pet como "Adotado" (não pode mais ser solicitado).</li>
            <li><strong>Recusar:</strong> Marca o requerimento como "Recusado" e o pet continua disponível para outras solicitações.</li>
            <li>Requerimentos aceitos ou recusados aparecem no <strong>Relatório</strong> com histórico completo.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Requerimentos;