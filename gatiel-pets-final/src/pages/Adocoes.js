import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc
} from 'firebase/firestore';

function Adocoes() {
  const [adocoes, setAdocoes]       = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [pets, setPets]             = useState([]);
  const [editando, setEditando]     = useState(null);
  const [usuarioId, setUsuarioId]   = useState('');
  const [petId, setPetId]           = useState('');
  const [dataAdocao, setDataAdocao] = useState('');
  const [status, setStatus]         = useState('');
  const [erro, setErro]             = useState('');

  // READ — Carrega usuários, pets e adoções do Firebase ao iniciar a página
  useEffect(() => {
    async function carregar() {
      const [snapUsuarios, snapPets, snapAdocoes] = await Promise.all([
        getDocs(collection(db, 'usuarios')),
        getDocs(collection(db, 'pets')),
        getDocs(collection(db, 'adocoes')),
      ]);

      setUsuarios(snapUsuarios.docs.map(d => ({ id: d.id, ...d.data() })));
      setPets(snapPets.docs.map(d => ({ id: d.id, ...d.data() })));
      setAdocoes(snapAdocoes.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    carregar();
  }, []);

  function nomeUsuario(id) {
    const u = usuarios.find(x => x.id === id);
    return u ? u.nome : 'Desconhecido';
  }

  function nomePet(id) {
    const p = pets.find(x => x.id === id);
    return p ? p.nome : 'Desconhecido';
  }

  // CREATE
  async function handleCadastrar(e) {
    e.preventDefault();
    setErro('');
    if (!usuarioId || !petId || !dataAdocao || !status) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    
    const nova = { usuarioId, petId, dataAdocao, status };
    const docRef = await addDoc(collection(db, 'adocoes'), nova);

    // Se a adoção for aprovada ou concluída, muda o status do pet para 'Adotado' no banco
    if (status === 'Aprovada' || status === 'Concluída') {
      await updateDoc(doc(db, 'pets', petId), { status: 'Adotado' });
      setPets(pets.map(p => p.id === petId ? { ...p, status: 'Adotado' } : p));
    }

    setAdocoes([...adocoes, { id: docRef.id, ...nova }]);
    limparFormulario();
  }

  // Preenche o formulário para edição
  function handlePrepararEdicao(a) {
    setEditando(a);
    setUsuarioId(a.usuarioId);
    setPetId(a.petId);
    setDataAdocao(a.dataAdocao);
    setStatus(a.status);
    setErro('');
  }

  // UPDATE
  async function handleAtualizar(e) {
    e.preventDefault();
    setErro('');
    if (!usuarioId || !petId || !dataAdocao || !status) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const dados = { usuarioId, petId, dataAdocao, status };
    await updateDoc(doc(db, 'adocoes', editando.id), dados);

    if (status === 'Aprovada' || status === 'Concluída') {
      await updateDoc(doc(db, 'pets', petId), { status: 'Adotado' });
      setPets(pets.map(p => p.id === petId ? { ...p, status: 'Adotado' } : p));
    }

    setAdocoes(adocoes.map(a => a.id === editando.id ? { ...a, ...dados } : a));
    limparFormulario();
  }

  // DELETE
  async function handleExcluir(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta adoção?')) return;
    await deleteDoc(doc(db, 'adocoes', id));
    setAdocoes(adocoes.filter(a => a.id !== id));
  }

  function limparFormulario() {
    setEditando(null);
    setUsuarioId(''); setPetId(''); setDataAdocao(''); setStatus('');
    setErro('');
  }

  // 💡 LÓGICA DE FILTRAGEM COMBINADA (PERFEITA):
  const petsDisponiveis = pets.filter(pet => {
    // Exceção imediata: Se for o pet da adoção que estamos editando agora, ele DEVE aparecer
    if (pet.id === petId) return true;

    // Regra A: O pet não pode ter o status textual de "Adotado"
    const ehAdotadoPorStatus = pet.status === 'Adotado';

    // Regra B: O pet não pode estar registrado em nenhuma outra adoção da lista
    const jaEstaEmAlgumaAdocao = adocoes.some(adocao => adocao.petId === pet.id);

    // O animal só fica disponível se não quebrar nenhuma das duas regras
    return !ehAdotadoPorStatus && !jaEstaEmAlgumaAdocao;
  });

  return (
    <div>
      <h2>📋 Adoções</h2>

      <div className="card p-4 mb-4 shadow-sm">
        <h5>{editando ? '✏️ Editar Adoção' : '➕ Registrar Adoção'}</h5>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={editando ? handleAtualizar : handleCadastrar}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Usuário (Adotante) *</label>
              <select className="form-select" value={usuarioId} onChange={e => setUsuarioId(e.target.value)}>
                <option value="">Selecione um usuário...</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Pet *</label>
              <select className="form-select" value={petId} onChange={e => setPetId(e.target.value)}>
                <option value="">Selecione um pet disponível...</option>
                {petsDisponiveis.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.especie})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Data da Adoção *</label>
              <input type="date" className="form-control" value={dataAdocao} onChange={e => setDataAdocao(e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Status da Adoção *</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Selecione o status...</option>
                <option value="Em Análise">Em Análise</option>
                <option value="Aprovada">Aprovada (Define o Pet como Adotado)</option>
                <option value="Concluída">Concluída (Define o Pet como Adotado)</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn text-white" style={{ backgroundColor: '#e8973c' }}>
              {editando ? 'Salvar Alterações' : 'Registrar'}
            </button>
            {editando && (
              <button type="button" className="btn btn-secondary" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card p-4 shadow-sm">
        <h5>Histórico de Adoções</h5>
        {adocoes.length === 0 ? (
          <p className="text-muted">Nenhuma adoção registrada.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-warning">
                <tr>
                  <th>Usuário</th><th>Pet</th><th>Data da Adoção</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {adocoes.map(a => (
                  <tr key={a.id}>
                    <td>{nomeUsuario(a.usuarioId)}</td>
                    <td>{nomePet(a.petId)}</td>
                    <td>{a.dataAdocao ? new Date(a.dataAdocao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <span className={`badge ${
                        a.status === 'Aprovada'   ? 'bg-success' :
                        a.status === 'Cancelada'  ? 'bg-danger' :
                        a.status === 'Concluída'  ? 'bg-secondary' :
                        'bg-warning text-dark'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm me-2" onClick={() => handlePrepararEdicao(a)}>✏️ Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(a.id)}>🗑️ Excluir</button>
                    </td>
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

export default Adocoes;