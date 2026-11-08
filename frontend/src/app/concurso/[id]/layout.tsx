'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useConcurso } from '../../../context/ConcursoContext';
import { ConcursoTabs } from '../../../components/layout/ConcursoTabs';

export default function ConcursoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params?.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { concursoSelecionado, selecionarConcurso } = useConcurso();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (id && concursoSelecionado?.id !== id) {
      selecionarConcurso(id);
    }
  }, [id, concursoSelecionado?.id, authLoading, isAuthenticated, router, selecionarConcurso]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ConcursoTabs concursoId={id} />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {children}
      </div>
    </div>
  );
}

