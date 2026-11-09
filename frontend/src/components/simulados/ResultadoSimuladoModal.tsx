'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { RelatorioCorrecao } from '../../types';
import { CheckCircle2, XCircle, AlertCircle, Award, Percent, Pencil } from 'lucide-react';

interface ResultadoSimuladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomeSimulado: string;
  relatorio: RelatorioCorrecao;
  // Callback opcional para abrir a edição manual do gabarito
  onEditGabarito?: () => void;
}

export function ResultadoSimuladoModal({
  isOpen,
  onClose,
  nomeSimulado,
  relatorio,
  onEditGabarito,
}: ResultadoSimuladoModalProps) {
  if (!relatorio) return null;

  const isSuccess = relatorio.notaPercentual >= 70;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Relatório de Correção: ${nomeSimulado}`}
      description="Resultado detalhado da comparação entre o gabarito oficial e suas respostas"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Painel de Métricas Principais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 mb-1" />
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {relatorio.totalAcertos}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Acertos
            </div>
          </div>

          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col items-center justify-center text-center">
            <XCircle size={24} className="text-rose-600 dark:text-rose-400 mb-1" />
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
              {relatorio.totalErros}
            </div>
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              Erros
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col items-center justify-center text-center">
            <Award size={24} className="text-indigo-600 dark:text-indigo-400 mb-1" />
            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
              {relatorio.totalQuestoes}
            </div>
            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Questões
            </div>
          </div>

          <div className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center ${
            isSuccess
              ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          }`}>
            <Percent size={24} className={isSuccess ? 'text-emerald-600' : 'text-amber-600'} />
            <div className={`text-2xl font-black ${isSuccess ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {relatorio.notaPercentual}%
            </div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Aproveitamento
            </div>
          </div>
        </div>

        {/* Lista de Questões Erradas */}
        {relatorio.questoesErradas.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle size={18} />
              <span>Questões que você errou ({relatorio.questoesErradas.length}):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {relatorio.questoesErradas.map((q) => (
                <div
                  key={q.numero}
                  className="flex items-center justify-between p-2.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Questão {q.numero}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold" title="Sua resposta">
                      Sua: {q.respostaAluno || 'Em Branco'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold" title="Resposta correta da banca">
                      Gabarito: {q.respostaCorreta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 text-center font-bold">
            🎉 Parabéns! Você acertou todas as questões! Gabarito 100% perfeito!
          </div>
        )}

        {/* Grade Geral de Todas as Questões */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Espelho Completo de Respostas:
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-1">
            {relatorio.detalhes?.map((d) => (
              <div
                key={d.numero}
                className={`p-2 rounded-lg border text-center text-xs flex flex-col items-center justify-center ${
                  d.status === 'CORRETO'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-700 dark:text-emerald-400'
                    : d.status === 'ANULADA'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-700 dark:text-amber-400'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-700 dark:text-rose-400'
                }`}
              >
                <span className="font-extrabold text-[10px] text-slate-500">Q{d.numero}</span>
                <span className="font-bold text-sm">
                  {d.status === 'ANULADA' ? 'X' : d.respostaAluno || '-'}
                </span>
                <span className="text-[9px] text-slate-400">Gab: {d.respostaOficial}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ação: editar gabarito manualmente */}
        {onEditGabarito && (
          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onEditGabarito}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <Pencil size={14} />
              <span>Editar Gabarito (adicionar/editar/remover questões)</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

