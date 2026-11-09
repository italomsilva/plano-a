'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api, getApiErrorMessage } from '../../services/api';
import { Simulado, RelatorioCorrecao } from '../../types';
import { CheckCircle2, Plus, Trash2, AlertCircle } from 'lucide-react';

const ALTERNATIVAS = ['A', 'B', 'C', 'D', 'E', 'X'];

interface QuestaoItem {
  key: string;
  numero: number;
  alternativa: string;
}

interface EditarGabaritoModalProps {
  isOpen: boolean;
  simClose: () => void;
  simulado: Simulado;
  onSaved: (simuladoAtualizado: Simulado, relatorio: RelatorioCorrecao) => void;
}

/**
 * Modal de edição manual do gabarito de um simulado já criado.
 * Permite adicionar, editar (número/alternativa) e remover questões do
 * gabarito oficial, além de revisar o gabarito do aluno.
 * Ao salvar, o backend recalcula a correção completa.
 */
export function EditarGabaritoModal({
  isOpen,
  simClose,
  simulado,
  onSaved,
}: EditarGabaritoModalProps) {
  const [questoes, setQuestoes] = useState<QuestaoItem[]>([]);
  const [gabaritoAluno, setGabaritoAluno] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ao abrir o modal, carrega o gabarito atual do simulado
  useEffect(() => {
    if (!isOpen) return;
    setError('');

    const mapa = simulado.gabaritoOficial || {};
    const itens: QuestaoItem[] = Object.entries(mapa)
      .map(([numero, alternativa]) => ({
        key: `questao-${numero}`,
        numero: parseInt(numero, 10),
        alternativa: String(alternativa).toUpperCase().trim(),
      }))
      .filter((q) => !isNaN(q.numero) && q.numero > 0)
      .sort((a, b) => a.numero - b.numero);

    setQuestoes(itens);
    setGabaritoAluno(simulado.gabaritoAluno || '');
  }, [isOpen, simulado]);

  const adicionarQuestao = () => {
    const maiorNumero = questoes.reduce(
      (max, q) => (q.numero > max ? q.numero : max),
      0,
    );
    setQuestoes((prev) => [
      ...prev,
      {
        key: `questao-${Date.now()}-${prev.length}`,
        numero: maiorNumero + 1,
        alternativa: '',
      },
    ]);
  };

  const removerQuestao = (key: string) => {
    setQuestoes((prev) => prev.filter((q) => q.key !== key));
  };

  const atualizarNumero = (key: string, numero: number) => {
    setQuestoes((prev) =>
      prev.map((q) => (q.key === key ? { ...q, numero } : q)),
    );
    setError('');
  };

  const atualizarAlternativa = (key: string, alternativa: string) => {
    setQuestoes((prev) =>
      prev.map((q) => (q.key === key ? { ...q, alternativa } : q)),
    );
    setError('');
  };

  const validarQuestoes = (): boolean => {
    if (questoes.length === 0) {
      setError('O gabarito precisa ter pelo menos uma questão.');
      return false;
    }

    for (const q of questoes) {
      if (!q.numero || q.numero <= 0 || Number.isNaN(q.numero)) {
        setError('Números de questão inválidos. Use apenas números positivos inteiros.');
        return false;
      }
      if (!ALTERNATIVAS.includes(q.alternativa)) {
        setError(`Alternativa inválida na questão ${q.numero}. Use apenas: A, B, C, D, E ou X (anulada).`);
        return false;
      }
    }

    const numeros = questoes.map((q) => q.numero);
    const duplicados = numeros.filter((n, i) => numeros.indexOf(n) !== i);
    if (duplicados.length > 0) {
      setError(
        `Questões duplicadas: ${Array.from(new Set(duplicados)).join(', ')}. Informe cada questão apenas uma vez.`,
      );
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
    setError('');

    if (!validarQuestoes()) return;

    try {
      setLoading(true);

      const res = await api.put(`/simulados/${simulado.id}/gabarito`, {
        gabaritoOficial: questoes.map((q) => ({
          numero: q.numero,
          alternativa: q.alternativa,
        })),
        gabaritoAluno,
      });

      const data = res.data;

      const atualizado: Simulado = {
        id: simulado.id,
        concursoId: simulado.concursoId,
        nome: data.nome,
        ano: data.ano,
        dataRealizacao: data.dataRealizacao,
        gabaritoOficial: data.gabaritoOficial,
        gabaritoAluno: data.gabaritoAluno,
        totalAcertos: data.totalAcertos,
        totalErros: data.totalErros,
        totalQuestoes: data.totalQuestoes,
        notaPercentual: data.notaPercentual,
        detalhes: data.detalhes,
        createdAt: data.createdAt,
      };

      simClose();
      onSaved(atualizado, data.relatorio);
    } catch (err) {
      // Exibe alerta claro na UI quando a API falha (validação, rede ou erro interno)
      setError(
        getApiErrorMessage(
          err,
          'Falha ao salvar o gabarito editado. Tente novamente.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={simClose}
      title={`Editar Gabarito: ${simulado.nome}`}
      description="Adicione, corrija ou remova questões do gabarito oficial. A correção será recalculada automaticamente ao salvar."
      maxWidth="2xl"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={simClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={loading}
            onClick={handleSalvar}
          >
            Salvar e Recalcular Correção
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Lista de Questões do Gabarito Oficial */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>
                Gabarito Oficial ({questoes.length}{' '}
                {questoes.length === 1 ? 'questão' : 'questões'})
              </span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Edite os campos ou remova itens incorretos
            </span>
          </div>

          {questoes.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3">
              Nenhuma questão no gabarito. Clique em &quot;Adicionar Questão&quot; para começar.
            </p>
          )}

          <div className="space-y-2">
            {questoes.map((q) => (
              <div
                key={q.key}
                className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 w-8 text-center">
                  Q
                </span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={q.numero || ''}
                  onChange={(e) => atualizarNumero(q.key, Number(e.target.value))}
                  className="w-20 px-2 py-1.5 text-sm font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={q.alternativa}
                  onChange={(e) =>
                    atualizarAlternativa(q.key, e.target.value)
                  }
                  className={`
                    flex-1 px-2 py-1.5 text-sm font-bold rounded-lg border h-9 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                    ${
                      q.alternativa
                        ? q.alternativa === 'X'
                          ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    }
                  `}
                >
                  <option value="" disabled>
                    Alternativa da questão
                  </option>
                  {ALTERNATIVAS.map((alt) => (
                    <option key={alt} value={alt}>
                      {alt === 'X' ? 'X (Anulada)' : alt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removerQuestao(q.key)}
                  disabled={loading}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  title="Remover questão"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={adicionarQuestao}
            disabled={loading}
            className="px-2.5 py-1 text-xs bg-slate-800 dark:bg-indigo-600 text-white rounded-lg font-medium hover:bg-slate-700 dark:hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            <span>Adicionar Questão</span>
          </button>
        </div>

        {/* Gabarito do Aluno (opcionalmente revisável) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Gabarito do Aluno (Suas Respostas)
          </label>
          <textarea
            rows={5}
            value={gabaritoAluno}
            onChange={(e) => {
              setGabaritoAluno(e.target.value);
              setError('');
            }}
            placeholder="1-A&#10;2-C&#10;3-B"
            className="w-full font-mono text-xs px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>
    </Modal>
  );
}
