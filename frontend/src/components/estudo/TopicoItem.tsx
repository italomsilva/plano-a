'use client';

import React, { useState } from 'react';
import { TopicoEstudo } from '../../types';
import { Check, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

interface TopicoItemProps {
  topico: TopicoEstudo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

export function TopicoItem({
  topico,
  onToggle,
  onDelete,
  onUpdateTitle,
}: TopicoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(topico.titulo);

  const handleSave = () => {
    if (title.trim() && title.trim() !== topico.titulo) {
      onUpdateTitle(topico.id, title.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${
        topico.concluido
          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 opacity-80'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-300'
      }`}
    >
      {/* Checkbox personalizável */}
      <button
        type="button"
        onClick={() => onToggle(topico.id)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
          topico.concluido
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-900'
        }`}
      >
        {topico.concluido && <Check size={13} strokeWidth={3} />}
      </button>

      {/* Conteúdo / Título */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full text-xs px-2 py-1 rounded border border-indigo-400 bg-white dark:bg-slate-900 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-medium hover:bg-indigo-700"
            >
              Salvar
            </button>
          </div>
        ) : (
          <p
            onClick={() => onToggle(topico.id)}
            className={`text-xs select-none cursor-pointer leading-relaxed ${
              topico.concluido
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {topico.titulo}
          </p>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Editar Tópico"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(topico.id)}
          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
          title="Excluir Tópico"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

