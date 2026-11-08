'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { RelatorioCorrecao } from '../../types';

interface SimuladoModalProps {
  isOpen: boolean;
  onClose: () => void;
  concursoId: string;
  onSuccess: (relatorio: RelatorioCorrecao, nomeSimulado: string) => void;
}

export function SimuladoModal({
  isOpen,
  onClose,
  concursoId,
  onSuccess,
}: SimuladoModalProps) {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dataRealizacao, setDataRealizacao] = useState(
    new Date().toISOString().split('T')[0],
  );

  // Gabarito Oficial
  const [gabaritoOficialMap, setGabaritoOficialMap] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [ocrProvider, setOcrProvider] = useState<string>('');
  const [manualGabaritoText, setManualGabaritoText] = useState('');

  // Gabarito do Aluno
  const [gabaritoAluno, setGabaritoAluno] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tratar Upload de Imagem do Gabarito Oficial
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploadingImage(true);
      setError('');
      const res = await api.post('/vision-ocr/parse-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.gabarito && Object.keys(res.data.gabarito).length > 0) {
        setGabaritoOficialMap(res.data.gabarito);
        setOcrProvider(res.data.provider || 'Visão Computacional');
      } else {
        setError(
          res.data?.message ||
            'Não foi possível extrair respostas claras da imagem. Digite abaixo ou envie outra foto mais nítida.',
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha no processamento da imagem do gabarito. Tente novamente.',
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Preencher gabarito oficial manual se colar texto
  const handleParseManualOficial = () => {
    if (!manualGabaritoText.trim()) return;
    const lines = manualGabaritoText.split(/\r?\n/);
    const map: Record<string, string> = {};
    const regex = /(\d{1,3})\s*[-:.)\s]+\s*([A-Ea-eXx])/g;

    for (const line of lines) {
      let m;
      while ((m = regex.exec(line)) !== null) {
        map[m[1]] = m[2].toUpperCase();
      }
    }

    if (Object.keys(map).length > 0) {
      setGabaritoOficialMap(map);
      setOcrProvider('Texto Manual');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !ano || !dataRealizacao) {
      setError('Preencha os campos obrigatórios do simulado.');
      return;
    }

    if (Object.keys(gabaritoOficialMap).length === 0) {
      setError(
        'Forneça o gabarito oficial através de upload de imagem ou preenchimento manual.',
      );
      return;
    }

    if (!gabaritoAluno.trim()) {
      setError('Digite suas respostas no campo Gabarito do Aluno.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/simulados', {
        concursoId,
        nome: nome.trim(),
        ano: Number(ano),
        dataRealizacao: new Date(dataRealizacao).toISOString(),
        gabaritoOficial: gabaritoOficialMap,
        gabaritoAluno,
      });

      const relatorio: RelatorioCorrecao = res.data.relatorio;

      if (relatorio && relatorio.notaPercentual >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      onClose();
      onSuccess(relatorio, nome);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha ao processar e salvar simulado. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const totalQuestoesDetectadas = Object.keys(gabaritoOficialMap).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Simulado & Correção Inteligente"
      description="Faça upload do gabarito oficial da banca e digite suas respostas para correção automática instantânea."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Dados Básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Nome do Simulado"
              placeholder="Ex: Simulado 01 - FGV TJ-SP"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="Ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <Input
            label="Data de Realização"
            type="date"
            value={dataRealizacao}
            onChange={(e) => setDataRealizacao(e.target.value)}
            required
          />
        </div>

        {/* 1. Gabarito Oficial (Upload de Imagem) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>Gabarito Oficial (Upload da Imagem da Banca)</span>
            </label>
            {ocrProvider && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                Extraído via {ocrProvider} ({totalQuestoesDetectadas} questões)
              </span>
            )}
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-white dark:bg-slate-900">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploadingImage}
            />
            {isUploadingImage ? (
              <div className="py-2 flex flex-col items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="text-xs font-semibold text-indigo-600">
                  Hermes IA analisando folha de respostas...
                </span>
              </div>
            ) : totalQuestoesDetectadas > 0 ? (
              <div className="py-2 flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle2 size={20} />
                <span className="text-xs font-bold">
                  {totalQuestoesDetectadas} questões extraídas com sucesso! Clique para substituir imagem.
                </span>
              </div>
            ) : (
              <div className="py-2 flex flex-col items-center justify-center gap-1">
                <Upload size={22} className="text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Clique ou arraste a imagem do gabarito oficial aqui
                </span>
                <span className="text-[11px] text-slate-400">
                  Suporta PNG, JPG, JPEG (tabelas e colunas reconhecidas automaticamente)
                </span>
              </div>
            )}
          </div>

          {/* Fallback ou revisão manual do gabarito oficial */}
          {totalQuestoesDetectadas === 0 && (
            <div className="pt-2">
              <details className="text-[11px] text-slate-500 cursor-pointer">
                <summary className="font-medium text-indigo-600 hover:underline">
                  Ou digite/cole o gabarito oficial manualmente
                </summary>
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={3}
                    placeholder="1-A&#10;2-C&#10;3-B"
                    value={manualGabaritoText}
                    onChange={(e) => setManualGabaritoText(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleParseManualOficial}
                    className="px-2.5 py-1 text-xs bg-slate-800 dark:bg-indigo-600 text-white rounded-lg font-medium hover:bg-slate-700"
                  >
                    Carregar Texto Oficial
                  </button>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* 2. Gabarito do Aluno */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>Gabarito do Aluno (Suas Respostas)</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Formato: 1-A, 2-C, 3-B (linha por linha)
            </span>
          </div>
          <textarea
            rows={6}
            value={gabaritoAluno}
            onChange={(e) => setGabaritoAluno(e.target.value)}
            placeholder="1-A&#10;2-C&#10;3-B&#10;4-D&#10;5-E"
            className="w-full font-mono text-xs px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading || isUploadingImage}
            disabled={totalQuestoesDetectadas === 0 || !gabaritoAluno.trim()}
          >
            Processar Correção e Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

