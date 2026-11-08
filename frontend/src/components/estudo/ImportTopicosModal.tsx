'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { Sparkles, ListPlus, CheckCircle2 } from 'lucide-react';

interface ImportTopicosModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
  materiaNome: string;
  onSuccess: () => void;
}

export function ImportTopicosModal({
  isOpen,
  onClose,
  materiaId,
  materiaNome,
  onSuccess,
}: ImportTopicosModalProps) {
  const [textoBruto, setTextoBruto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preview em tempo real da separação por ponto e vírgula
  const parsedPreview = useMemo(() => {
    return textoBruto
      .split(';')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [textoBruto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parsedPreview.length === 0) {
      setError('Insira ao menos um tópico separado por ponto e vírgula (;).');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/materias/${materiaId}/topicos/importar`, {
        textoBruto,
      });

      setTextoBruto('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Falha ao importar tópicos. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Importar Tópicos: ${materiaNome}`}
      description="Cole o conteúdo do edital com os tópicos separados por ponto e vírgula (;)"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Texto com Tópicos (delimitados por ;)
            </label>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              {parsedPreview.length} {parsedPreview.length === 1 ? 'tópico detectado' : 'tópicos detectados'}
            </span>
          </div>
          <textarea
            rows={5}
            value={textoBruto}
            onChange={(e) => setTextoBruto(e.target.value)}
            placeholder="Exemplo: Princípios da Administração; Ato Administrativo; Licitações Lei 14.133; Processo Administrativo; Poder de Polícia"
            className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
          />
        </div>

        {/* Pré-visualização dos tópicos gerados */}
        {parsedPreview.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles size={14} className="text-indigo-500" />
              <span>Itens que serão adicionados ao checklist:</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {parsedPreview.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[9px] flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={parsedPreview.length === 0}
          >
            <ListPlus size={15} />
            Importar {parsedPreview.length > 0 ? `(${parsedPreview.length})` : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

