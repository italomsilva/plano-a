'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Concurso } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ConcursoContextType {
  concursos: Concurso[];
  concursoSelecionado: Concurso | null;
  loading: boolean;
  selecionarConcurso: (id: string) => Promise<void>;
  carregarConcursos: () => Promise<void>;
  atualizarConcursoAtual: () => Promise<void>;
}

const ConcursoContext = createContext<ConcursoContextType>({} as ConcursoContextType);

export function ConcursoProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [concursoSelecionado, setConcursoSelecionado] = useState<Concurso | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarConcursos = useCallback(async () => {
    if (!isAuthenticated) {
      setConcursos([]);
      setConcursoSelecionado(null);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/concursos');
      const list: Concurso[] = res.data;
      setConcursos(list);

      // Restaurar seleção salva no localStorage se existir
      const savedId = localStorage.getItem('concurso_selecionado_id');
      if (savedId) {
        const found = list.find((c) => c.id === savedId);
        if (found) {
          // Buscar detalhes completos do concurso
          const detailRes = await api.get(`/concursos/${savedId}`);
          setConcursoSelecionado(detailRes.data);
          return;
        }
      }

      // Se não havia concurso salvo mas temos concursos, seleciona o primeiro
      if (list.length > 0 && !concursoSelecionado) {
        const detailRes = await api.get(`/concursos/${list[0].id}`);
        setConcursoSelecionado(detailRes.data);
        localStorage.setItem('concurso_selecionado_id', list[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar concursos:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const selecionarConcurso = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/concursos/${id}`);
      setConcursoSelecionado(res.data);
      localStorage.setItem('concurso_selecionado_id', id);
    } catch (err) {
      console.error('Erro ao selecionar concurso:', err);
    } finally {
      setLoading(false);
    }
  };

  const atualizarConcursoAtual = useCallback(async () => {
    if (!concursoSelecionado) return;
    try {
      const res = await api.get(`/concursos/${concursoSelecionado.id}`);
      setConcursoSelecionado(res.data);
    } catch (err) {
      console.error('Erro ao atualizar dados do concurso atual:', err);
    }
  }, [concursoSelecionado?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarConcursos();
    }
  }, [isAuthenticated, carregarConcursos]);

  return (
    <ConcursoContext.Provider
      value={{
        concursos,
        concursoSelecionado,
        loading,
        selecionarConcurso,
        carregarConcursos,
        atualizarConcursoAtual,
      }}
    >
      {children}
    </ConcursoContext.Provider>
  );
}

export const useConcurso = () => useContext(ConcursoContext);

