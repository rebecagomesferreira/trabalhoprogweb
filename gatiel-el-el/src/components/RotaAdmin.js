import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RotaAdmin({ children }) {
  const { usuario } = useAuth();
  if (!usuario)                 return <Navigate to="/login" />;
  if (usuario.role !== 'admin') return <Navigate to="/user/pets" />;
  return children;
}

export default RotaAdmin;
