'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useConcurso } from '../../context/ConcursoContext';
import { ConcursoCard } from '../../components/concurso/ConcursoCard';
import { ConcursoModal } from '../../components/concurso/ConcursoModal';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { Plus, Trophy, Target, BookOpen, Sparkles } from 'lucide-react';

export default function ConcursosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { concursos, concursoSelecionado, selecionarConcurso, carregarConcursos } = useConcurso();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDeleteConcurso = async (id: string) => {
    try {
      await api.delete(`/concursos/${id}`);
      await carregarConcursos();
    } catch (err) {
      console.error('Erro ao deletar concurso:', err);
      alert('Erro ao excluir concurso.');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Banner de Boas-vindas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-6 sm:p-8 mb-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-100 mb-3 border border-white/20">
            <Sparkles size={13} className="text-emerald-300" />
            <span>Painel do Concurseiro de Elite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Olá, {user?.username}! Pronto para sua próxima posse?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Selecione seu concurso ativo abaixo para gerenciar matérias do edital,
            corrigir simulados com IA ou ajustar seu cronograma semanal.
          </p>
        </div>
      </div>

      {/* Cabeçalho da Lista e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Seus Concursos ({concursos.length})
          </h2>
          <p className="text-xs text-slate-500">
            Cada concurso possui seu próprio edital, simulados e grade semanal independentes.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="md">
          <Plus size={16} />
          <span>Cadastrar Concurso</span>
        </Button>
      </div>

      {/* Grade de Concursos */}
      {concursos.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center max-w-lg mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Nenhum concurso cadastrado ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
            Cadastre seu concurso foco (ex: TJ-SP, Receita Federal, INSS) para começar a mapear o edital e os simulados.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Cadastrar Meu Primeiro Concurso</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {concursos.map((c) => (
            <ConcursoCard
              key={c.id}
              concurso={c}
              isSelected={concursoSelecionado?.id === c.id}
              onSelect={(id) => selecionarConcurso(id)}
              onDelete={handleDeleteConcurso}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação de Concurso */}
      <ConcursoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => carregarConcursos()}
      />
    </div>
  );
}

