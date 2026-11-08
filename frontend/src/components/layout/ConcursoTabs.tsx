'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FileCheck2,
  Calendar,
  Clock,
  Building,
} from 'lucide-react';
import { useConcurso } from '../../context/ConcursoContext';

interface ConcursoTabsProps {
  concursoId: string;
}

export function ConcursoTabs({ concursoId }: ConcursoTabsProps) {
  const pathname = usePathname();
  const { concursoSelecionado } = useConcurso();

  // Calcular contagem regressiva para a prova
  const calcularDiasRestantes = () => {
    if (!concursoSelecionado?.dataProva) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prova = new Date(concursoSelecionado.dataProva);
    prova.setHours(0, 0, 0, 0);
    const diffTime = prova.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasRestantes = calcularDiasRestantes();

  const tabs = [
    {
      name: 'Visão Geral',
      href: `/concurso/${concursoId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Estudo (Edital & Checklist)',
      href: `/concurso/${concursoId}/estudo`,
      icon: CheckSquare,
      exact: false,
    },
    {
      name: 'Simulados & Gabarito IA',
      href: `/concurso/${concursoId}/simulados`,
      icon: FileCheck2,
      exact: false,
    },
    {
      name: 'Cronograma Semanal',
      href: `/concurso/${concursoId}/cronograma`,
      icon: Calendar,
      exact: false,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner do Concurso Ativo */}
        <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Building size={14} />
              <span>{concursoSelecionado?.orgao || 'Concurso'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {concursoSelecionado?.nome || 'Carregando concurso...'}
            </h1>
          </div>

          {/* Badge de Contagem Regressiva */}
          {diasRestantes !== null && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl">
              <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  Data da Prova
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {diasRestantes > 0
                    ? `${diasRestantes} dias restantes`
                    : diasRestantes === 0
                    ? 'É HOJE! Boa prova!'
                    : `Prova realizada há ${Math.abs(diasRestantes)} dias`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Abas de Navegação */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 py-3.5 px-3 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

