'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useConcurso } from '../../context/ConcursoContext';
import {
  LogOut,
  Layers,
  ChevronDown,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { concursos, concursoSelecionado, selecionarConcurso } = useConcurso();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-6">
          <Link
            href="/concursos"
            className="flex items-center space-x-2.5 font-bold text-xl text-slate-900 dark:text-white group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-tight">
                Plano <span className="text-indigo-600 dark:text-indigo-400">A</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">
                Hermes Agent
              </span>
            </div>
          </Link>

          {/* Seletor de Concurso Ativo */}
          <div className="hidden md:flex items-center relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Layers size={14} className="text-indigo-500 mr-2" />
              <span className="max-w-[180px] truncate">
                {concursoSelecionado ? concursoSelecionado.nome : 'Selecione um Concurso'}
              </span>
              <ChevronDown
                size={14}
                className={`ml-1 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu com backdrop */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-modal-enter">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Seus Concursos
                  </div>
                  {concursos.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      Nenhum concurso cadastrado.
                    </div>
                  ) : (
                    concursos.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          selecionarConcurso(c.id);
                          setDropdownOpen(false);
                          router.push(`/concurso/${c.id}`);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          concursoSelecionado?.id === c.id
                            ? 'bg-indigo-50/70 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{c.nome}</span>
                        <span className="text-[10px] text-slate-400">{c.orgao}</span>
                      </button>
                    ))
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  <Link
                    href="/concursos"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  >
                    <PlusCircle size={14} className="mr-1.5" />
                    Gerenciar / Novo Concurso
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {user?.username}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Concurseiro Ativo
            </span>
          </div>

          <button
            onClick={logout}
            title="Sair da conta"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
