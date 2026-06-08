import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

function PetsDisponiveis() {
  const [pets, setPets]             = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalPet, setModalPet]     = useState(null);
  const [mensagem, setMensagem]     = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [sucesso, setSucesso]       = useState('');
  const [erro, setErro]             = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    async function carregar() {
      const snapshot = await getDocs(collection(db, 'pets'));
      const todos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPets(todos.filter(p => p.status === 'Disponível'));
      setCarregando(false);
    }
    carregar();
  }, []);

  function abrirModal(pet) {
    setModalPet(pet); setMensagem(''); setSucesso(''); setErro('');
  }

  async function handleSolicitar() {
    setEnviando(true); setErro('');
    try {
      await addDoc(collection(db, 'requerimentos'), {
        usuarioId:   usuario.id,
        usuarioNome: usuario.nome,
        petId:       modalPet.id,
        petNome:     modalPet.nome,
        petEspecie:  modalPet.especie,
        mensagem:    mensagem.trim(),
        status:      'Pendente',
        dataEnvio:   new Date().toISOString(),
      });
      setSucesso(`Solicitação para adotar ${modalPet.nome} enviada com sucesso!`);
      setPets(prev => prev.filter(p => p.id !== modalPet.id));
      setTimeout(() => setModalPet(null), 2000);
    } catch (err) {
      setErro('Erro ao enviar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  function icone(e) {
    return e === 'Cachorro' ? '🐕' : e === 'Gato' ? '🐈' : e === 'Pássaro' ? '🐦' : e === 'Coelho' ? '🐇' : '🐾';
  }

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#e8973c22 0%,#fff8f0 100%)', borderLeft:'4px solid #e8973c', borderRadius:8, padding:'20px 24px', marginBottom:24 }}>
        <h2 style={{ color:'#e8973c', margin:0 }}>🐾 Pets disponíveis para adoção</h2>
        <p className="text-muted mb-0 mt-1">Encontre seu novo melhor amigo e envie uma solicitação.</p>
      </div>

      {carregando ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color:'#e8973c' }} />
          <p className="text-muted mt-2">Carregando pets...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-5 card border-0 shadow-sm">
          <div style={{ fontSize:'3rem' }}>🐾</div>
          <p className="text-muted mt-2 fw-semibold">Nenhum pet disponível no momento.</p>
          <p className="text-muted small">Volte em breve — novos pets são cadastrados regularmente!</p>
        </div>
      ) : (
        <div className="row g-4">
          {pets.map(pet => (
            <div className="col-md-4 col-sm-6" key={pet.id}>
              <div className="card h-100 border-0 shadow-sm position-relative" style={{ borderRadius:12 }}>
                <span className="badge bg-success position-absolute top-0 end-0 m-3" style={{ fontSize:'0.8rem' }}>
                  Disponível
                </span>

                <div style={{ height:220, overflow:'hidden', backgroundColor:'#f8f9fa', borderRadius:'12px 12px 0 0' }}>
                  {pet.fotoUrl ? (
                    <img src={pet.fotoUrl} alt={pet.nome} className="w-100 h-100" style={{ objectFit:'cover' }} />
                  ) : (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                      <span style={{ fontSize:'3.5rem' }}>{icone(pet.especie)}</span>
                      <span className="small mt-1">Sem foto</span>
                    </div>
                  )}
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold mb-1">{pet.nome}</h5>
                  <p className="text-secondary small mb-3">{pet.especie}{pet.raca ? ` • ${pet.raca}` : ''}</p>

                  <div className="row g-2 mb-3 bg-light p-2 rounded text-center small">
                    <div className="col-6 border-end">
                      <span className="text-muted d-block">Idade</span>
                      <strong>{pet.idade ? `${pet.idade} ano(s)` : '—'}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Sexo</span>
                      <strong>{pet.sexo || '—'}</strong>
                    </div>
                  </div>

                  <button className="btn mt-auto text-white fw-semibold"
                    style={{ backgroundColor:'#e8973c', borderRadius:8 }}
                    onClick={() => abrirModal(pet)}>
                    💛 Solicitar adoção
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalPet && (
        <div className="modal d-block" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius:16 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  💛 Solicitar adoção de <span style={{ color:'#e8973c' }}>{modalPet.nome}</span>
                </h5>
                <button className="btn-close" onClick={() => setModalPet(null)} />
              </div>
              <div className="modal-body">
                {sucesso ? (
                  <div className="alert alert-success text-center">✅ {sucesso}</div>
                ) : (
                  <>
                    {erro && <div className="alert alert-danger small">{erro}</div>}
                    <p className="text-muted small mb-3">
                      Adicione uma mensagem opcional explicando por que você seria um bom lar.
                    </p>
                    <label className="form-label fw-semibold">Mensagem (opcional)</label>
                    <textarea className="form-control" rows={4}
                      placeholder={`Ex: Tenho quintal grande e muito amor para dar ao ${modalPet.nome}...`}
                      value={mensagem} onChange={e => setMensagem(e.target.value)} />
                  </>
                )}
              </div>
              {!sucesso && (
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={() => setModalPet(null)}>Cancelar</button>
                  <button className="btn text-white fw-semibold"
                    style={{ backgroundColor:'#e8973c' }}
                    onClick={handleSolicitar} disabled={enviando}>
                    {enviando ? 'Enviando...' : '✅ Confirmar solicitação'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PetsDisponiveis;
