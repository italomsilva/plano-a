'use client';

import React, { useState } from 'react';
import { Simulado, RelatorioCorrecao } from '../../types';
import { ResultadoSimuladoModal } from './ResultadoSimuladoModal';
import { EditarGabaritoModal } from './EditarGabaritoModal';
import {
  FileCheck2,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';

interface SimuladoCardProps {
  simulado: Simulado;
  onDelete: (id: string) => void;
  // Prop opcional para editar o gabarito do simulado
  onUpdated?: (atualizado: Simulado) => void;
}

export function SimuladoCard({ simulado, onDelete, onUpdated }: SimuladoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleGabaritoSaved = (
    atualizado: Simulado,
    relatorio: RelatorioCorrecao,
  ) => {
    onUpdated?.(atualizado);
    // Reabre o relatório já recalculado logo após a edição
    setIsModalOpen(true);
  };

  const dataFormatada = new Date(simulado.dataRealizacao).toLocaleDateString(
    'pt-BR',
    { timeZone: 'UTC' },
  );

  const isSuccess = simulado.notaPercentual >= 70;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Ano {simulado.ano}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {simulado.nome}
            </h3>
          </div>
          <div className="flex items-start gap-1">
            <button
              onClick={() => setIsEditOpen(true)}
              className="text-slate-400 hover:text-indigo-500 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
              title="Editar Gabarito (adicionar/editar/remover questões)"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Deseja excluir o simulado "${simulado.nome}"?`)) {
                  onDelete(simulado.id);
                }
              }}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Excluir Simulado"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <Calendar size={14} />
          <span>Realizado em: {dataFormatada}</span>
        </div>

        {/* Indicadores de Desempenho */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 size={12} />
              <span>Acertos</span>
            </div>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
              {simulado.totalAcertos}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
              <XCircle size={12} />
              <span>Erros</span>
            </div>
            <div className="text-lg font-black text-rose-700 dark:text-rose-300">
              {simulado.totalErros}
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              isSuccess
                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-300'
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-center gap-1">
              <Award size={12} />
              <span>Nota</span>
            </div>
            <div className="text-lg font-black">{simulado.notaPercentual}%</div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          <Eye size={14} />
          <span>Ver Relatório Completo & Erros</span>
        </button>
      </div>

      {/* Modal de Relatório Detalhado */}
      {simulado.detalhes && (
        <ResultadoSimuladoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          nomeSimulado={simulado.nome}
          relatorio={simulado.detalhes}
          onEditGabarito={() => {
            setIsModalOpen(false);
            setIsEditOpen(true);
          }}
        />
      )}

      {/* Modal de Edição Manual do Gabarito */}
      <EditarGabaritoModal
        isOpen={isEditOpen}
        simClose={() => setIsEditOpen(false)}
        simulado={simulado}
        onSaved={handleGabaritoSaved}
      />
    </>
  );
}

