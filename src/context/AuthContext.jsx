import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const usuarioNome = localStorage.getItem('usuarioNome');
    const tipo = localStorage.getItem('tipo');
    const token = localStorage.getItem('token');

    console.log('Verificando token no localStorage:', { usuarioId, tipo, hasToken: !!token });

    if (usuarioId && usuarioNome && tipo && token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        console.log('Token decodificado:', decodedToken);
        if (decodedToken.exp > currentTime) {
          setUser({ id: usuarioId, nome: usuarioNome, tipo, token });
          console.log('Usuário configurado:', { id: usuarioId, nome: usuarioNome, tipo });
        } else {
          console.log('Token expirado, chamando logout');
          logout();
        }
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        logout();
      }
    } else {
      console.log('Dados incompletos no localStorage, não configurando usuário');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.token) {
      try {
        const decodedToken = jwtDecode(user.token);
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        if (currentTime < expirationTime) {
          const timeout = expirationTime - currentTime;
          console.log(`Configurando temporizador para logout em ${timeout}ms para tipo: ${user.tipo}`);
          const timer = setTimeout(() => {
            console.log('Temporizador acionado, chamando logout para tipo:', user.tipo);
            logout();
          }, timeout);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Erro ao configurar temporizador de expiração:', error);
        logout();
      }
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });
      const data = await response.json();
      if (response.ok) {
        const usuarioId = data.usuario_id;
        localStorage.setItem('usuario_id', usuarioId);
        localStorage.setItem('email', email);
        localStorage.setItem('usuarioNome', data.nome);
        localStorage.setItem('tipo', data.tipo);
        localStorage.setItem('token', data.token);
        setUser({ id: usuarioId, nome: data.nome, tipo: data.tipo, token: data.token });
        console.log('Login bem-sucedido, usuário configurado:', { id: usuarioId, tipo: data.tipo });
        return data.tipo;
      } else {
        throw new Error(data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout chamado, tipo:', user?.tipo);
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('email');
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('tipo');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      throw new Error('Nenhum token disponível. Por favor, faça login.');
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        logout();
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      logout();
      throw new Error('Token inválido. Por favor, faça login novamente.');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      logout();
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};