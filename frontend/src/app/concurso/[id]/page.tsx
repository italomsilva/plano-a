'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useConcurso } from '../../../context/ConcursoContext';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import {
  CheckSquare,
  FileCheck2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function ConcursoOverviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { concursoSelecionado } = useConcurso();

  if (!concursoSelecionado) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const dataProva = new Date(concursoSelecionado.dataProva).toLocaleDateString(
    'pt-BR',
    { timeZone: 'UTC' },
  );

  const dataResultado = concursoSelecionado.dataResultado
    ? new Date(concursoSelecionado.dataResultado).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progresso Geral do Edital */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Checklist do Edital
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <CheckSquare size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {concursoSelecionado.progressoEstudo || 0}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {concursoSelecionado.topicosConcluidos || 0} de{' '}
              {concursoSelecionado.totalTopicos || 0} tópicos concluídos
            </p>
            <ProgressBar progress={concursoSelecionado.progressoEstudo || 0} size="md" />
          </div>

          <Link
            href={`/concurso/${id}/estudo`}
            className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-4 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Gerenciar matérias e edital</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Simulados e Desempenho */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulados Realizados
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <FileCheck2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {concursoSelecionado.totalSimulados || 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Média de acertos:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {concursoSelecionado.mediaSimulados || 0}%
              </strong>
            </p>
          </div>

          <Link
            href={`/concurso/${id}/simulados`}
            className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-4 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Corrigir gabaritos com IA</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Datas Chave & Cronograma */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cronograma & Prazos
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Calendar size={18} />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Data da Prova
                </span>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {dataProva}
                </div>
              </div>

              {dataResultado && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Previsão de Resultado
                  </span>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {dataResultado}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/concurso/${id}/cronograma`}
            className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-4 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Abrir grade semanal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="p-6 bg-indigo-50/70 dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Próximo passo recomendado
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Cole o conteúdo do edital na aba <strong className="text-indigo-600 dark:text-indigo-400">Estudo</strong> ou suba a foto de um simulado para correção automática.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/concurso/${id}/estudo`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Acessar Edital & Checklist
          </Link>
        </div>
      </div>
    </div>
  );
}
