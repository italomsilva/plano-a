'use client';

import React, { useState } from 'react';
import { Materia } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { TopicoItem } from './TopicoItem';
import { ImportTopicosModal } from './ImportTopicosModal';
import {
  BookMarked,
  ListPlus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MateriaCardProps {
  materia: Materia;
  onToggleTopico: (topicoId: string) => void;
  onDeleteTopico: (topicoId: string) => void;
  onUpdateTopicoTitle: (topicoId: string, title: string) => void;
  onAddTopico: (materiaId: string, titulo: string) => Promise<void>;
  onDeleteMateria: (materiaId: string) => void;
  onReload: () => void;
}

export function MateriaCard({
  materia,
  onToggleTopico,
  onDeleteTopico,
  onUpdateTopicoTitle,
  onAddTopico,
  onDeleteMateria,
  onReload,
}: MateriaCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [novoTopico, setNovoTopico] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTopicoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTopico.trim()) return;

    try {
      setIsAdding(true);
      await onAddTopico(materia.id, novoTopico.trim());
      setNovoTopico('');
    } finally {
      setIsAdding(false);
    }
  };

  const total = materia.topicos.length;
  const concluidos = materia.topicos.filter((t) => t.concluido).length;
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
      {/* Cabeçalho da Matéria */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookMarked size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {materia.nome}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {concluidos} de {total} tópicos concluídos ({progresso}%)
            </p>
          </div>
        </div>

        {/* Barra de Progresso e Ações */}
        <div className="flex items-center gap-4">
          <div className="w-32 hidden sm:block">
            <ProgressBar progress={progresso} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors"
              title="Importar tópicos separados por ponto e vírgula"
            >
              <ListPlus size={14} />
              <span>Importar com ;</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Deseja excluir a matéria "${materia.nome}" e todos os seus tópicos?`)) {
                  onDeleteMateria(materia.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Excluir Matéria"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de progresso para mobile */}
      <div className="sm:hidden px-5 pt-2">
        <ProgressBar progress={progresso} size="sm" />
      </div>

      {/* Conteúdo Expansível: Lista de Tópicos */}
      {isOpen && (
        <div className="p-5 space-y-4">
          {/* Adicionar Tópico Rápido */}
          <form onSubmit={handleAddTopicoSubmit} className="flex gap-2">
            <input
              type="text"
              value={novoTopico}
              onChange={(e) => setNovoTopico(e.target.value)}
              placeholder="Adicionar tópico individual..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isAdding || !novoTopico.trim()}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50"
            >
              <Plus size={14} />
              <span>Adicionar</span>
            </button>
          </form>

          {/* Lista de Tópicos */}
          {materia.topicos.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              Nenhum tópico cadastrado nesta matéria.
              <br />
              Clique em <strong className="text-indigo-600 dark:text-indigo-400">Importar com ;</strong> para colar o edital ou adicione acima.
            </div>
          ) : (
            <div className="space-y-2">
              {materia.topicos.map((topico) => (
                <TopicoItem
                  key={topico.id}
                  topico={topico}
                  onToggle={onToggleTopico}
                  onDelete={onDeleteTopico}
                  onUpdateTitle={onUpdateTopicoTitle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Importação com Ponto e Vírgula */}
      <ImportTopicosModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        materiaId={materia.id}
        materiaNome={materia.nome}
        onSuccess={onReload}
      />
    </div>
  );
}

