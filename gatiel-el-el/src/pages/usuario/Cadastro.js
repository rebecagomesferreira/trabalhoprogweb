import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

function Cadastro() {
  const [nome, setNome]         = useState('');
  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro]         = useState('');
  const [sucesso, setSucesso]   = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleCadastrar(e) {
    e.preventDefault();
    setErro('');
    if (!nome || !email || !senha) { setErro('Nome, e-mail e senha são obrigatórios.'); return; }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return; }

    setCarregando(true);
    try {
      const uid = `user_${Date.now()}`;
      await setDoc(doc(db, 'usuarios', uid), {
        nome, email, telefone, role: 'user',
        criadoEm: new Date().toISOString(),
      });
      login({ id: uid, nome, email, role: 'user' });
      setSucesso(true);
      setTimeout(() => navigate('/user/pets'), 1200);
    } catch (err) {
      setErro('Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: '#fff8f0', fontFamily: "'Baloo', cursive" }}>
      <div className="card border-0 shadow p-4" style={{ width: 460, borderRadius: 16 }}>

        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem' }}>🐾</div>
          <h3 className="fw-bold" style={{ color: 'rgb(235, 167, 104)' }}>Criar conta</h3>
          <p className="text-muted small">Cadastre-se para solicitar adoções</p>
        </div>

        {sucesso && <div className="alert alert-success text-center">✅ Conta criada! Redirecionando...</div>}
        {erro    && <div className="alert alert-danger small py-2">⚠️ {erro}</div>}

        <form onSubmit={handleCadastrar}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Nome completo *</label>
            <input className="form-control" value={nome}
              onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">E-mail *</label>
            <input type="email" className="form-control" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Senha * <span className="fw-normal text-muted">(mín. 6 caracteres)</span></label>
            <input type="password" className="form-control" value={senha}
              onChange={e => setSenha(e.target.value)} placeholder="••••••" />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Telefone</label>
            <input className="form-control" value={telefone}
              onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-0000" />
          </div>
          <button type="submit" className="btn w-100 text-white fw-bold"
            style={{ backgroundColor: 'rgb(235, 167, 104)', borderRadius: 8 }}
            disabled={carregando}>
            {carregando ? 'Criando conta...' : '✅ Criar conta'}
          </button>
        </form>

        <p className="text-center text-muted small mt-3 mb-0">
          Já tem conta?{' '}
          <Link to="/login" style={{ color: 'rgb(235, 167, 104)', fontWeight: 600 }}>Fazer login</Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
