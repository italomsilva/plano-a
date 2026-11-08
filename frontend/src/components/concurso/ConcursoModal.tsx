'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

interface ConcursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConcursoModal({ isOpen, onClose, onSuccess }: ConcursoModalProps) {
  const [nome, setNome] = useState('');
  const [orgao, setOrgao] = useState('');
  const [dataProva, setDataProva] = useState('');
  const [dataResultado, setDataResultado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !orgao.trim() || !dataProva) {
      setError('Por favor preencha todos os campos obrigatórios (*)');
      return;
    }

    try {
      setLoading(true);
      await api.post('/concursos', {
        nome: nome.trim(),
        orgao: orgao.trim(),
        dataProva: new Date(dataProva).toISOString(),
        dataResultado: dataResultado ? new Date(dataResultado).toISOString() : undefined,
      });

      // Resetar formulário
      setNome('');
      setOrgao('');
      setDataProva('');
      setDataResultado('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Falha ao salvar concurso. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Concurso Público"
      description="Cadastre seu concurso para estruturar todo o plano de estudos, edital e simulados."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Nome do Concurso"
          placeholder="Ex: TJ-SP Escrevente Técnico Judiciário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <Input
          label="Órgão / Entidade"
          placeholder="Ex: Tribunal de Justiça de São Paulo"
          value={orgao}
          onChange={(e) => setOrgao(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data da Prova"
            type="date"
            value={dataProva}
            onChange={(e) => setDataProva(e.target.value)}
            required
          />

          <Input
            label="Data do Resultado (Opcional)"
            type="date"
            value={dataResultado}
            onChange={(e) => setDataResultado(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading}>
            Cadastrar Concurso
          </Button>
        </div>
      </form>
    </Modal>
  );
}

