'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Materia } from '../../../../types';
import { api } from '../../../../services/api';
import { MateriaCard } from '../../../../components/estudo/MateriaCard';
import { ProgressBar } from '../../../../components/ui/ProgressBar';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { useConcurso } from '../../../../context/ConcursoContext';
import {
  BookOpen,
  Plus,
  CheckSquare,
} from 'lucide-react';

export default function EstudoPage() {
  const params = useParams();
  const concursoId = params?.id as string;
  const { atualizarConcursoAtual } = useConcurso();

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewMateriaModalOpen, setIsNewMateriaModalOpen] = useState(false);
  const [nomeNovaMateria, setNomeNovaMateria] = useState('');
  const [criandoMateria, setCriandoMateria] = useState(false);

  const carregarMaterias = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const res = await api.get(`/materias?concursoId=${concursoId}`);
        setMaterias(res.data);
        atualizarConcursoAtual().catch(() => {});
      } catch (err) {
        console.error('Erro ao carregar matérias:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [concursoId, atualizarConcursoAtual],
  );

  useEffect(() => {
    if (concursoId) {
      carregarMaterias(true);
    }
  }, [concursoId, carregarMaterias]);   // provavelmente erro aqui

  // Alternar status concluído do tópico
  const handleToggleTopico = async (topicoId: string) => {
    try {
      // Atualização otimista imediata
      setMaterias((prev) =>
        prev.map((m) => ({
          ...m,
          topicos: m.topicos.map((t) =>
            t.id === topicoId ? { ...t, concluido: !t.concluido } : t,
          ),
        })),
      );

      await api.patch(`/materias/topicos/${topicoId}/toggle`);
      carregarMaterias(false);
    } catch (err) {
      console.error('Erro ao alternar tópico:', err);
      carregarMaterias(false);
    }
  };

  // Excluir tópico
  const handleDeleteTopico = async (topicoId: string) => {
    try {
      setMaterias((prev) =>
        prev.map((m) => ({
          ...m,
          topicos: m.topicos.filter((t) => t.id !== topicoId),
        })),
      );
      await api.delete(`/materias/topicos/${topicoId}`);
      carregarMaterias(false);
    } catch (err) {
      console.error('Erro ao excluir tópico:', err);
      carregarMaterias(false);
    }
  };

  // Atualizar título do tópico
  const handleUpdateTopicoTitle = async (topicoId: string, newTitle: string) => {
    try {
      await api.put(`/materias/topicos/${topicoId}`, { titulo: newTitle });
      carregarMaterias(false);
    } catch (err) {
      console.error('Erro ao atualizar título do tópico:', err);
    }
  };

  // Adicionar tópico individual
  const handleAddTopico = async (materiaId: string, titulo: string) => {
    try {
      await api.post(`/materias/${materiaId}/topicos`, { titulo });
      carregarMaterias(false);
    } catch (err) {
      console.error('Erro ao adicionar tópico:', err);
    }
  };

  // Excluir matéria
  const handleDeleteMateria = async (materiaId: string) => {
    try {
      setMaterias((prev) => prev.filter((m) => m.id !== materiaId));
      await api.delete(`/materias/${materiaId}`);
      carregarMaterias(false);
    } catch (err) {
      console.error('Erro ao excluir matéria:', err);
      carregarMaterias(false);
    }
  };

  // Criar nova matéria
  const handleCreateMateriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovaMateria.trim()) return;

    try {
      setCriandoMateria(true);
      await api.post('/materias', {
        concursoId,
        nome: nomeNovaMateria.trim(),
      });
      setNomeNovaMateria('');
      setIsNewMateriaModalOpen(false);
      await carregarMaterias(false);
    } catch (err) {
      console.error('Erro ao criar matéria:', err);
      alert('Erro ao criar matéria.');
    } finally {
      setCriandoMateria(false);
    }
  };

  // Cálculos de progresso geral do concurso nesta aba
  let totalTopicosGeral = 0;
  let topicosConcluidosGeral = 0;

  materias.forEach((m) => {
    totalTopicosGeral += m.topicos.length;
    topicosConcluidosGeral += m.topicos.filter((t) => t.concluido).length;
  });

  const progressoGeral =
    totalTopicosGeral > 0
      ? Math.round((topicosConcluidosGeral / totalTopicosGeral) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Barra Geral de Progresso do Concurso */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare size={20} className="text-emerald-500" />
              <span>Progresso Geral do Edital</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {topicosConcluidosGeral} de {totalTopicosGeral} tópicos concluídos em {materias.length} matéria(s)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {progressoGeral}%
            </span>
            <Button onClick={() => setIsNewMateriaModalOpen(true)} size="sm">
              <Plus size={15} />
              <span>Adicionar Matéria</span>
            </Button>
          </div>
        </div>

        <ProgressBar progress={progressoGeral} size="lg" />
      </div>

      {/* Lista de Matérias */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <span>Carregando matérias do concurso...</span>
        </div>
      ) : materias.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Nenhuma matéria cadastrada ainda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
            Adicione matérias (ex: Português, Direito Constitucional) e cole os tópicos com ponto e vírgula.
          </p>
          <Button onClick={() => setIsNewMateriaModalOpen(true)}>
            <Plus size={16} />
            <span>Adicionar Primeira Matéria</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {materias.map((materia) => (
            <MateriaCard
              key={materia.id}
              materia={materia}
              onToggleTopico={handleToggleTopico}
              onDeleteTopico={handleDeleteTopico}
              onUpdateTopicoTitle={handleUpdateTopicoTitle}
              onAddTopico={handleAddTopico}
              onDeleteMateria={handleDeleteMateria}
              onReload={() => carregarMaterias(false)}
            />
          ))}
        </div>
      )}

      {/* Modal Nova Matéria */}
      <Modal
        isOpen={isNewMateriaModalOpen}
        onClose={() => setIsNewMateriaModalOpen(false)}
        title="Nova Matéria"
        description="Cadastre uma disciplina cobrada no edital do seu concurso."
      >
        <form onSubmit={handleCreateMateriaSubmit} className="space-y-4">
          <Input
            label="Nome da Matéria / Disciplina"
            placeholder="Ex: Direito Administrativo, Língua Portuguesa, Raciocínio Lógico"
            value={nomeNovaMateria}
            onChange={(e) => setNomeNovaMateria(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewMateriaModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={criandoMateria}>
              Adicionar Matéria
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
