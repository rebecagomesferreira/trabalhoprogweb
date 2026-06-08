import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaAdmin   from './components/RotaAdmin';
import RotaUsuario from './components/RotaUsuario';
import Navbar        from './components/Navbar';
import NavbarUsuario from './components/NavbarUsuario';

// Páginas públicas
import Login    from './pages/Login';
import Cadastro from './pages/usuario/Cadastro';

// Páginas admin
import Dashboard      from './pages/Dashboard';
import Usuarios       from './pages/Usuarios';
import Pets           from './pages/Pets';
import Adocoes        from './pages/Adocoes';
import Requerimentos  from './pages/Requerimentos';
import Relatorio      from './pages/Relatorio';

// Páginas usuário comum
import PetsDisponiveis from './pages/usuario/PetsDisponiveis';
import MeusPedidos     from './pages/usuario/MeusPedidos';

import 'bootstrap/dist/css/bootstrap.min.css';

function PaginaAdmin({ children }) {
  return (
    <RotaAdmin>
      <Navbar />
      <div className="container mt-4 pb-5">{children}</div>
    </RotaAdmin>
  );
}

function PaginaUsuario({ children }) {
  return (
    <RotaUsuario>
      <NavbarUsuario />
      <div className="container mt-4 pb-5">{children}</div>
    </RotaUsuario>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Área do usuário comum */}
          <Route path="/user/pets"         element={<PaginaUsuario><PetsDisponiveis /></PaginaUsuario>} />
          <Route path="/user/meus-pedidos" element={<PaginaUsuario><MeusPedidos /></PaginaUsuario>} />

          {/* Área administrativa */}
          <Route path="/admin"                  element={<PaginaAdmin><Dashboard /></PaginaAdmin>} />
          <Route path="/admin/usuarios"         element={<PaginaAdmin><Usuarios /></PaginaAdmin>} />
          <Route path="/admin/pets"             element={<PaginaAdmin><Pets /></PaginaAdmin>} />
          <Route path="/admin/adocoes"          element={<PaginaAdmin><Adocoes /></PaginaAdmin>} />
          <Route path="/admin/requerimentos"    element={<PaginaAdmin><Requerimentos /></PaginaAdmin>} />
          <Route path="/admin/relatorio"        element={<PaginaAdmin><Relatorio /></PaginaAdmin>} />

          <Route path="/"  element={<Navigate to="/login" />} />
          <Route path="*"  element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
