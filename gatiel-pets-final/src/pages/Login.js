import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }

    if (email === 'admin@gatiel.com' && senha === '1234') {
      login({ id: 'admin_001', nome: 'Administrador', email, role: 'admin' });
      navigate('/admin');
    } else if (email === 'user@gatiel.com' && senha === '1234') {
      login({ id: 'user_demo', nome: 'Usuário Teste', email, role: 'user' });
      navigate('/user/pets');
    } else {
      setErro('E-mail ou senha incorretos.');
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: '#fff8f0', fontFamily: "'Baloo', cursive" }}>
      <div className="card border-0 shadow p-4" style={{ width: 420, borderRadius: 16 }}>

        <div className="text-center mb-4">
          <div style={{ fontSize: '3rem' }}>🐾</div>
          <h3 className="fw-bold" style={{ color: 'rgb(235, 167, 104)' }}>Cafofo dos Peludos</h3>
          <p className="text-muted small mb-0">Sistema de adoção de animais</p>
        </div>

        {erro && (
          <div className="alert alert-danger py-2 small">⚠️ {erro}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">E-mail</label>
            <input type="email" className="form-control" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Senha</label>
            <input type="password" className="form-control" value={senha}
              onChange={e => setSenha(e.target.value)} placeholder="••••••" />
          </div>
          <button type="submit" className="btn w-100 text-white fw-bold"
            style={{ backgroundColor: 'rgb(235, 167, 104)', borderRadius: 8, fontSize: '1rem' }}>
            Entrar
          </button>
        </form>

        <hr className="my-3" />
        <p className="text-center text-muted small mb-2">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" style={{ color: 'rgb(235, 167, 104)', fontWeight: 600 }}>
            Cadastre-se aqui
          </Link>
        </p>

        {/* Dica de teste */}
        <div className="alert alert-light border small text-muted mb-0" style={{ borderRadius: 8 }}>
          <strong>Contas de teste:</strong><br />
          🛠 Admin: admin@gatiel.com / 1234<br />
          👤 Usuário: user@gatiel.com / 1234
        </div>
      </div>
    </div>
  );
}

export default Login;
