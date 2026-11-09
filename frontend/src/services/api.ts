import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar JWT Token do localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('plano_a_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para redirecionar em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('plano_a_token');
      localStorage.removeItem('plano_a_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Extrai uma mensagem de erro legível da resposta da API.
 * O ValidationPipe do NestJS devolve `message` como string OU como array
 * de mensagens de validação; também cobre falhas de rede/timeout.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;

  if (anyErr?.response?.data) {
    const data = anyErr.response.data;
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join('; ');
  }

  if (anyErr?.code === 'ECONNABORTED' || anyErr?.message === 'Network Error') {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  return fallback;
}

