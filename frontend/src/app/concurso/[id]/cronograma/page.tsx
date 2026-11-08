'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { GradeSemanal } from '../../../../components/cronograma/GradeSemanal';
import { Calendar, Sparkles } from 'lucide-react';

export default function CronogramaPage() {
  const params = useParams();
  const concursoId = params?.id as string;

  return (
    <div className="space-y-6">
      {/* Banner Explicativo */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <Calendar size={16} />
            <span>Organização Semanal Flexível</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Grade de Estudos Semanal
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Planeje seus blocos de horários de segunda a domingo. Adicione ou remova linhas de acordo com sua rotina, personalize o texto de cada bloco e escolha a cor de fundo para identificar as matérias.
          </p>
        </div>
      </div>

      {/* Componente da Grade */}
      <GradeSemanal concursoId={concursoId} />
    </div>
  );
}

