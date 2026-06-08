import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import PetRow from '../components/PetRow';

function Pets() {
  const [pets, setPets]         = useState([]);
  const [editando, setEditando] = useState(null);
  const [nome, setNome]         = useState('');
  const [especie, setEspecie]   = useState('');
  const [raca, setRaca]         = useState('');
  const [idade, setIdade]       = useState('');
  const [sexo, setSexo]         = useState('');
  const [status, setStatus]     = useState('');
  const [fotoUrl, setFotoUrl]   = useState('');
  const [erro, setErro]         = useState('');

  useEffect(() => {
    async function carregar() {
      const snapshot = await getDocs(collection(db, 'pets'));
      setPets(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    carregar();
  }, []);

  // CREATE
  async function handleCadastrar(e) {
    e.preventDefault();
    setErro('');
    if (!nome || !especie || !sexo || !status) {
      setErro('Nome, espécie, sexo e status são obrigatórios.');
      return;
    }
    const novo = { nome, especie, raca, idade, sexo, status, fotoUrl };
    const docRef = await addDoc(collection(db, 'pets'), novo);
    setPets([...pets, { id: docRef.id, ...novo }]);
    limparFormulario();
  }

  // UPDATE
  async function handleSalvarEdicao(e) {
    e.preventDefault();
    setErro('');
    if (!nome || !especie || !sexo || !status) {
      setErro('Nome, espécie, sexo e status são obrigatórios.');
      return;
    }

    const dadosAtualizados = { nome, especie, raca, idade, sexo, status, fotoUrl };
    await updateDoc(doc(db, 'pets', editando.id), dadosAtualizados);

    setPets(pets.map(p => p.id === editando.id ? { id: editando.id, ...dadosAtualizados } : p));
    limparFormulario();
  }

  // DELETE
  async function handleExcluir(id) {
    if (window.confirm('Tem certeza que deseja excluir este pet?')) {
      await deleteDoc(doc(db, 'pets', id));
      setPets(pets.filter(p => p.id !== id));
    }
  }

  function handlePrepararEdicao(pet) {
    setEditando(pet);
    setNome(pet.nome);
    setEspecie(pet.especie);
    setRaca(pet.raca || '');
    setIdade(pet.idade || '');
    setSexo(pet.sexo);
    setStatus(pet.status);
    setFotoUrl(pet.fotoUrl || ''); 
  }

  function limparFormulario() {
    setEditando(null);
    setNome(''); setEspecie(''); setRaca(''); setIdade(''); setSexo(''); setStatus(''); setFotoUrl('');
    setErro('');
  }

  return (
    <div className="container py-2">
      <h3 className="mb-4 fw-bold">🐾 Gerenciamento de Pets</h3>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* Formulário de Cadastro / Edição */}
      <div className="card p-4 shadow-sm border-0 mb-5 bg-white">
        <h5 className="fw-bold mb-3">{editando ? '✏️ Editar Informações do Pet' : '➕ Cadastrar Novo Pet'}</h5>
        <form onSubmit={editando ? handleSalvarEdicao : handleCadastrar}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-secondary small fw-bold">Nome *</label>
              <input type="text" className="form-control" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do Pet" />
            </div>
            <div className="col-md-4">
              <label className="form-label text-secondary small fw-bold">Espécie *</label>
              <select className="form-select" value={especie} onChange={e => setEspecie(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label text-secondary small fw-bold">Raça</label>
              <input type="text" className="form-control" value={raca} onChange={e => setRaca(e.target.value)} placeholder="Ex: Poodle, SRD" />
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary small fw-bold">Idade (anos)</label>
              <input type="number" className="form-control" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Idade aproximada" />
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary small fw-bold">Sexo *</label>
              <select className="form-select" value={sexo} onChange={e => setSexo(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary small fw-bold">Status *</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Disponível">Disponível</option>
                <option value="Adotado">Adotado</option>
                <option value="Em tratamento">Em tratamento</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary small fw-bold">URL da Foto</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="https://linkdaimagem.com/foto.jpg"
                value={fotoUrl} 
                onChange={e => setFotoUrl(e.target.value)} 
              />
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn px-4 text-white fw-bold" style={{ backgroundColor: '#e8973c' }}>
              {editando ? 'Salvar Alterações' : 'Cadastrar Pet'}
            </button>
            {editando && (
              <button type="button" className="btn btn-light px-4 border" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Seção da Listagem em Cards */}
      <div className="mb-3">
        <h5 className="fw-bold text-dark">Lista de Pets Cadastrados</h5>
        <hr className="text-muted opacity-25" />
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <p className="text-muted mb-0">Nenhum pet cadastrado até o momento.</p>
        </div>
      ) : (
        <div className="row">
          {pets.map(p => (
            <PetRow 
              key={p.id} 
              pet={p} 
              onEditar={handlePrepararEdicao} 
              onExcluir={handleExcluir} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Pets;