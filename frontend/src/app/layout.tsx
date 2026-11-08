import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ConcursoProvider } from '../context/ConcursoContext';
import { Navbar } from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Plano A - Organização e Inteligência em Concursos Públicos',
  description:
    'Mapeie tópicos de estudo, corrija simulados com IA e estruture seu cronograma semanal com perfeição.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ConcursoProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </ConcursoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

