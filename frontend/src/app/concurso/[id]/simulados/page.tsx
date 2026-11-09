'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Simulado, RelatorioCorrecao } from '../../../../types';
import { api } from '../../../../services/api';
import { SimuladoCard } from '../../../../components/simulados/SimuladoCard';
import { SimuladoModal } from '../../../../components/simulados/SimuladoModal';
import { ResultadoSimuladoModal } from '../../../../components/simulados/ResultadoSimuladoModal';
import { Button } from '../../../../components/ui/Button';
import { useConcurso } from '../../../../context/ConcursoContext';
import {
  FileCheck2,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function SimuladosPage() {
  const params = useParams();
  const concursoId = params?.id as string;
  const { atualizarConcursoAtual } = useConcurso();

  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Modal para exibir resultado logo após a correção
  const [resultModalData, setResultModalData] = useState<{
    isOpen: boolean;
    relatorio: RelatorioCorrecao | null;
    nomeSimulado: string;
  }>({
    isOpen: false,
    relatorio: null,
    nomeSimulado: '',
  });

  const carregarSimulados = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const res = await api.get(`/simulados?concursoId=${concursoId}`);
        setSimulados(res.data);
        atualizarConcursoAtual().catch(() => {});
      } catch (err) {
        console.error('Erro ao carregar simulados:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [concursoId, atualizarConcursoAtual],
  );

  useEffect(() => {
    if (concursoId) {
      carregarSimulados(true);
    }
  }, [concursoId, carregarSimulados]);

  const handleDeleteSimulado = async (id: string) => {
    try {
      setSimulados((prev) => prev.filter((s) => s.id !== id));
      await api.delete(`/simulados/${id}`);
      carregarSimulados(false);
    } catch (err) {
      console.error('Erro ao excluir simulado:', err);
      carregarSimulados(false);
    }
  };

  const handleSimuladoCreated = (
    relatorio: RelatorioCorrecao,
    nomeSimulado: string,
  ) => {
    carregarSimulados(false);
    setResultModalData({
      isOpen: true,
      relatorio,
      nomeSimulado,
    });
  };

  // Atualiza o simulado na lista após edição manual do gabarito
  const handleSimuladoUpdated = (atualizado: Simulado) => {
    setSimulados((prev) =>
      prev.map((s) => (s.id === atualizado.id ? atualizado : s)),
    );
    atualizarConcursoAtual().catch(() => {});
  };

  // Calcular estatísticas gerais
  const total = simulados.length;
  const mediaAproveitamento =
    total > 0
      ? Math.round(
          simulados.reduce((acc, s) => acc + s.notaPercentual, 0) / total,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Banner de Cabeçalho dos Simulados */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles size={16} />
            <span>Visão Computacional & IA Integrada</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Simulados & Correção com Gabarito Oficial
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Tire uma foto do gabarito da banca (FGV, Vunesp, Cebraspe) e digite suas respostas. O Hermes extrai o gabarito e gera um relatório detalhado com seus erros e acertos.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {total > 0 && (
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-bold uppercase text-slate-400">
                Média Geral
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {mediaAproveitamento}%
              </div>
            </div>
          )}

          <Button onClick={() => setIsCreateModalOpen(true)} size="md">
            <Plus size={16} />
            <span>Novo Simulado</span>
          </Button>
        </div>
      </div>

      {/* Lista de Simulados */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span>Carregando simulados do concurso...</span>
        </div>
      ) : simulados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Nenhum simulado cadastrado ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
            Cadastre seu primeiro simulado com upload de foto do gabarito oficial da banca e confira seus erros e acertos.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Cadastrar Primeiro Simulado</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulados.map((simulado) => (
            <SimuladoCard
              key={simulado.id}
              simulado={simulado}
              onDelete={handleDeleteSimulado}
              onUpdated={handleSimuladoUpdated}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação / Correção de Simulado */}
      <SimuladoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        concursoId={concursoId}
        onSuccess={handleSimuladoCreated}
      />

      {/* Modal de Exibição Imediata do Resultado */}
      {resultModalData.relatorio && (
        <ResultadoSimuladoModal
          isOpen={resultModalData.isOpen}
          onClose={() =>
            setResultModalData({ isOpen: false, relatorio: null, nomeSimulado: '' })
          }
          nomeSimulado={resultModalData.nomeSimulado}
          relatorio={resultModalData.relatorio}
        />
      )}
    </div>
  );
}
