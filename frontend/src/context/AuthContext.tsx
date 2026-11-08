'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carregar usuário e token salvos
    const storedToken = localStorage.getItem('plano_a_token');
    const storedUser = localStorage.getItem('plano_a_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // Validar token no backend
        api
          .get('/auth/me')
          .then((res) => {
            setUser(res.data);
            localStorage.setItem('plano_a_user', JSON.stringify(res.data));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    const { user: loggedUser, accessToken } = res.data;

    setUser(loggedUser);
    setToken(accessToken);
    localStorage.setItem('plano_a_token', accessToken);
    localStorage.setItem('plano_a_user', JSON.stringify(loggedUser));
  };

  const register = async (username: string, password: string) => {
    const res = await api.post('/auth/register', { username, password });
    const { user: registeredUser, accessToken } = res.data;

    setUser(registeredUser);
    setToken(accessToken);
    localStorage.setItem('plano_a_token', accessToken);
    localStorage.setItem('plano_a_user', JSON.stringify(registeredUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('plano_a_token');
    localStorage.removeItem('plano_a_user');
    localStorage.removeItem('concurso_selecionado_id');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

