import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function Usuarios() {
  const [usuarios, setUsuarios]   = useState([]);
  const [editando, setEditando]   = useState(null);
  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [telefone, setTelefone]   = useState('');
  const [erro, setErro]           = useState('');

  // READ — carrega do Firebase ao abrir a página
  useEffect(() => {
    async function carregar() {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      setUsuarios(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    carregar();
  }, []);

  // CREATE
  async function handleCadastrar(e) {
    e.preventDefault();
    setErro('');
    if (!nome || !email || !senha) {
      setErro('Nome, e-mail e senha são obrigatórios.');
      return;
    }
    const novo = { nome, email, senha, telefone };
    const docRef = await addDoc(collection(db, 'usuarios'), novo);
    setUsuarios([...usuarios, { id: docRef.id, ...novo }]);
    limparFormulario();
  }

  // Preenche o formulário para editar
  function handlePrepararEdicao(usuario) {
    setEditando(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha(usuario.senha || '');
    setTelefone(usuario.telefone || '');
    setErro('');
  }

  // UPDATE
  async function handleAtualizar(e) {
    e.preventDefault();
    setErro('');
    if (!nome || !email) {
      setErro('Nome e e-mail são obrigatórios.');
      return;
    }
    const dados = { nome, email, senha, telefone };
    await updateDoc(doc(db, 'usuarios', editando.id), dados);
    setUsuarios(usuarios.map(u => u.id === editando.id ? { ...u, ...dados } : u));
    limparFormulario();
  }

  // DELETE
  async function handleExcluir(id) {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    await deleteDoc(doc(db, 'usuarios', id));
    setUsuarios(usuarios.filter(u => u.id !== id));
  }

  function limparFormulario() {
    setEditando(null);
    setNome(''); setEmail(''); setSenha(''); setTelefone('');
    setErro('');
  }

  return (
    <div>
      <h2>👤 Usuários</h2>

      <div className="card p-4 mb-4 shadow-sm">
        <h5>{editando ? '✏️ Editar Usuário' : '➕ Cadastrar Usuário'}</h5>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={editando ? handleAtualizar : handleCadastrar}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={nome}
                onChange={e => setNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="col-md-6">
              <label className="form-label">E-mail *</label>
              <input type="email" className="form-control" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Senha *</label>
              <input type="password" className="form-control" value={senha}
                onChange={e => setSenha(e.target.value)} placeholder="Senha" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Telefone</label>
              <input className="form-control" value={telefone}
                onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn text-white" style={{ backgroundColor: '#e8973c' }}>
              {editando ? 'Salvar Alterações' : 'Cadastrar'}
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
        <h5>Lista de Usuários</h5>
        {usuarios.length === 0 ? (
          <p className="text-muted">Nenhum usuário cadastrado.</p>
        ) : (
          <table className="table table-hover align-middle">
            <thead className="table-warning">
              <tr>
                <th>Nome</th><th>E-mail</th><th>Telefone</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.telefone || '—'}</td>
                  <td>
                    <button className="btn btn-primary btn-sm me-2"
                      onClick={() => handlePrepararEdicao(u)}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleExcluir(u.id)}>🗑️ Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Usuarios;