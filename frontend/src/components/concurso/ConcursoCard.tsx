'use client';

import React from 'react';
import Link from 'next/link';
import { Concurso } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Calendar,
  Building,
  CheckSquare,
  FileCheck2,
  ChevronRight,
  Trash2,
  Award,
} from 'lucide-react';

interface ConcursoCardProps {
  concurso: Concurso;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

export function ConcursoCard({
  concurso,
  onSelect,
  onDelete,
  isSelected,
}: ConcursoCardProps) {
  const dataProvaFormatada = new Date(concurso.dataProva).toLocaleDateString(
    'pt-BR',
    { timeZone: 'UTC' },
  );

  return (
    <div
      className={`relative group bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Building size={14} />
            <span>{concurso.orgao}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {concurso.nome}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Deseja realmente excluir o concurso "${concurso.nome}"?`)) {
              onDelete(concurso.id);
            }
          }}
          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100"
          title="Excluir Concurso"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Calendar size={14} className="text-slate-400" />
          <span>Prova: <strong>{dataProvaFormatada}</strong></span>
        </div>

        {/* Barra de Progresso do Edital */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare size={13} className="text-emerald-500" />
              Edital Concluído
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {concurso.progressoEstudo || 0}%
            </span>
          </div>
          <ProgressBar progress={concurso.progressoEstudo || 0} size="sm" />
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 mb-4 text-center">
        <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Matérias</div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {concurso.totalMaterias || 0}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Simulados</div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {concurso.totalSimulados || 0}
          </div>
        </div>
      </div>

      {/* Botão de Acessar */}
      <Link
        href={`/concurso/${concurso.id}`}
        onClick={() => onSelect(concurso.id)}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98]"
      >
        <span>Acessar Painel de Estudos</span>
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

