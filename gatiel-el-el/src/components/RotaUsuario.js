import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RotaUsuario({ children }) {
  const { usuario } = useAuth();
  if (!usuario)                return <Navigate to="/login" />;
  if (usuario.role === 'admin') return <Navigate to="/admin" />;
  return children;
}

export default RotaUsuario;
