import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(
    () => JSON.parse(localStorage.getItem('usuarioGatiel') || 'null')
  );

  function login(user) {
    setUsuario(user);
    localStorage.setItem('usuarioGatiel', JSON.stringify(user));
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem('usuarioGatiel');
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
