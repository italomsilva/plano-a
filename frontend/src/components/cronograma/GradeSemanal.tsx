'use client';

import React, { useState, useEffect } from 'react';
import { CronogramaItem } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import {
  Calendar,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Palette,
  Check,
} from 'lucide-react';

interface GradeSemanalProps {
  concursoId: string;
}

const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

const CORES_PALETA = [
  { name: 'Branco', hex: '#ffffff' },
  { name: 'Azul Claro', hex: '#eff6ff' },
  { name: 'Esmeralda', hex: '#f0fdf4' },
  { name: 'Âmbar', hex: '#fefce8' },
  { name: 'Roxo', hex: '#faf5ff' },
  { name: 'Rosa', hex: '#fff1f2' },
  { name: 'Índigo', hex: '#eef2ff' },
  { name: 'Cinza Suave', hex: '#f8fafc' },
];

export function GradeSemanal({ concursoId }: GradeSemanalProps) {
  const [totalLinhas, setTotalLinhas] = useState(4);
  const [grid, setGrid] = useState<Record<string, { conteudo: string; corFundo: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  // Carregar cronograma do backend
  useEffect(() => {
    const loadCronograma = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/cronograma?concursoId=${concursoId}`);
        const { totalLinhas: backendLinhas, items } = res.data;

        if (backendLinhas && backendLinhas > 0) {
          setTotalLinhas(backendLinhas);
        }

        const map: Record<string, { conteudo: string; corFundo: string }> = {};
        if (items && Array.isArray(items)) {
          items.forEach((it: CronogramaItem) => {
            const key = `${it.linhaIndex}_${it.diaSemana}`;
            map[key] = {
              conteudo: it.conteudo,
              corFundo: it.corFundo || '#ffffff',
            };
          });
        }
        setGrid(map);
      } catch (err) {
        console.error('Erro ao carregar cronograma:', err);
      } finally {
        setLoading(false);
      }
    };

    if (concursoId) {
      loadCronograma();
    }
  }, [concursoId]);

  const handleCellChange = (linha: number, dia: number, text: string) => {
    const key = `${linha}_${dia}`;
    setGrid((prev) => ({
      ...prev,
      [key]: {
        conteudo: text,
        corFundo: prev[key]?.corFundo || '#ffffff',
      },
    }));
  };

  const handleColorChange = (linha: number, dia: number, hex: string) => {
    const key = `${linha}_${dia}`;
    setGrid((prev) => ({
      ...prev,
      [key]: {
        conteudo: prev[key]?.conteudo || '',
        corFundo: hex,
      },
    }));
    setActiveColorPicker(null);
  };

  const handleAddLinha = () => {
    setTotalLinhas((prev) => prev + 1);
  };

  const handleRemoveLinha = () => {
    if (totalLinhas > 1) {
      setTotalLinhas((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const items: Array<{
        diaSemana: number;
        linhaIndex: number;
        conteudo: string;
        corFundo: string;
      }> = [];

      for (let l = 0; l < totalLinhas; l++) {
        for (let d = 0; d < 7; d++) {
          const key = `${l}_${d}`;
          const cell = grid[key];
          if (cell && (cell.conteudo.trim() || cell.corFundo !== '#ffffff')) {
            items.push({
              linhaIndex: l,
              diaSemana: d,
              conteudo: cell.conteudo,
              corFundo: cell.corFundo,
            });
          }
        }
      }

      await api.post('/cronograma/save', {
        concursoId,
        items,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar cronograma:', err);
      alert('Erro ao salvar cronograma. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Carregando sua grade semanal...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Controle de Linhas e Salvamento */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLinha}
          >
            <Plus size={14} />
            <span>Adicionar Bloco de Horário</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveLinha}
            disabled={totalLinhas <= 1}
          >
            <Minus size={14} />
            <span>Remover Bloco</span>
          </Button>
          <span className="text-xs text-slate-400">
            ({totalLinhas} {totalLinhas === 1 ? 'linha' : 'linhas'})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Check size={14} />
              Grade salva!
            </span>
          )}

          <Button type="button" onClick={handleSave} isLoading={saving}>
            <Save size={14} />
            <span>Salvar Cronograma</span>
          </Button>
        </div>
      </div>

      {/* Grade Semanal Responsiva com 7 Colunas Fixas */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full border-collapse text-left min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <th className="w-16 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bloco
              </th>
              {DIAS_SEMANA.map((dia, idx) => (
                <th
                  key={dia}
                  className="px-3 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span>{dia}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {idx === 5 || idx === 6 ? 'Fim de Semana' : 'Útil'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: totalLinhas }).map((_, linhaIdx) => (
              <tr
                key={linhaIdx}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/20"
              >
                {/* Indicador do Bloco */}
                <td className="px-2 py-2 text-center text-xs font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                  #{linhaIdx + 1}
                </td>

                {/* 7 Células da Linha */}
                {DIAS_SEMANA.map((_, diaIdx) => {
                  const key = `${linhaIdx}_${diaIdx}`;
                  const cell = grid[key] || { conteudo: '', corFundo: '#ffffff' };
                  const isPickerOpen = activeColorPicker === key;

                  return (
                    <td
                      key={diaIdx}
                      style={{ backgroundColor: cell.corFundo }}
                      className="border-l border-slate-200 dark:border-slate-700 p-2 relative align-top transition-colors group"
                    >
                      <div className="relative flex flex-col h-full min-h-[90px]">
                        <textarea
                          value={cell.conteudo}
                          onChange={(e) =>
                            handleCellChange(linhaIdx, diaIdx, e.target.value)
                          }
                          placeholder="Ex: 09:00 - 11:00&#10;Direito Adm."
                          className="w-full flex-1 bg-transparent text-xs p-1 resize-none focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium leading-relaxed rounded"
                        />

                        {/* Botão de Paleta de Cores */}
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveColorPicker(isPickerOpen ? null : key)
                            }
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 transition-colors opacity-40 group-hover:opacity-100"
                            title="Alterar cor desta célula"
                          >
                            <Palette size={13} />
                          </button>
                        </div>

                        {/* Popover Seletor de Cores */}
                        {isPickerOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveColorPicker(null)}
                            />
                            <div className="absolute right-0 bottom-8 z-50 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-44 grid grid-cols-4 gap-1.5 animate-modal-enter">
                              {CORES_PALETA.map((cor) => (
                                <button
                                  key={cor.hex}
                                  type="button"
                                  onClick={() =>
                                    handleColorChange(linhaIdx, diaIdx, cor.hex)
                                  }
                                  style={{ backgroundColor: cor.hex }}
                                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform shadow-xs flex items-center justify-center"
                                  title={cor.name}
                                >
                                  {cell.corFundo.toLowerCase() ===
                                    cor.hex.toLowerCase() && (
                                    <Check size={12} className="text-slate-700" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

