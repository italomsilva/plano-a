'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Sparkles, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('O nome de usuário deve ter no mínimo 3 caracteres.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await register(username.trim(), password);
      router.push('/concursos');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha ao registrar usuário. O nome de usuário já pode estar em uso.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/30">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Criar Nova Conta
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastro instantâneo sem necessidade de e-mail
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome de Usuário"
            placeholder="Ex: italo.concursos"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Senha (mínimo 4 caracteres)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirme a Senha"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={loading}>
            <UserPlus size={16} />
            <span>Cadastrar e Começar</span>
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Já possui uma conta?{' '}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

