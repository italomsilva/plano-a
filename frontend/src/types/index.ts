export interface User {
  id: string;
  username: string;
  createdAt?: string;
}

export interface Concurso {
  id: string;
  userId: string;
  nome: string;
  orgao: string;
  dataProva: string;
  dataResultado?: string | null;
  createdAt: string;
  totalMaterias?: number;
  totalTopicos?: number;
  topicosConcluidos?: number;
  progressoEstudo?: number;
  totalSimulados?: number;
  mediaSimulados?: number;
}

export interface TopicoEstudo {
  id: string;
  materiaId: string;
  titulo: string;
  concluido: boolean;
  ordem: number;
  createdAt?: string;
}

export interface Materia {
  id: string;
  concursoId: string;
  nome: string;
  topicos: TopicoEstudo[];
  totalTopicos?: number;
  topicosConcluidos?: number;
  progresso?: number;
  createdAt?: string;
}

export interface Simulado {
  id: string;
  concursoId: string;
  nome: string;
  ano: number;
  dataRealizacao: string;
  gabaritoOficial: Record<string, string>;
  gabaritoAluno: string;
  totalAcertos: number;
  totalErros: number;
  totalQuestoes: number;
  notaPercentual: number;
  detalhes?: RelatorioCorrecao;
  createdAt: string;
}

export interface RelatorioCorrecao {
  totalQuestoes: number;
  totalAcertos: number;
  totalErros: number;
  totalEmBranco: number;
  totalAnuladas: number;
  notaPercentual: number;
  questoesErradas: Array<{
    numero: number;
    respostaAluno: string | null;
    respostaCorreta: string;
  }>;
  questoesCorretas: Array<{
    numero: number;
    respostaAluno: string;
  }>;
  questoesAnuladas: number[];
  detalhes: Array<{
    numero: number;
    respostaOficial: string;
    respostaAluno: string | null;
    status: 'CORRETO' | 'ERRADO' | 'ANULADA' | 'EM_BRANCO';
  }>;
}

export interface CronogramaItem {
  id?: string;
  concursoId: string;
  diaSemana: number; // 0 a 6 (Segunda a Domingo)
  linhaIndex: number;
  conteudo: string;
  corFundo: string;
}

export interface CronogramaData {
  totalLinhas: number;
  items: CronogramaItem[];
}

