import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimuladoDto } from './dto/create-simulado.dto';
import { CorrigirSimuladoDto } from './dto/corrigir-simulado.dto';
import { VisionOcrService } from '../vision-ocr/vision-ocr.service';

export interface QuestaoCorrecao {
  numero: number;
  respostaOficial: string;
  respostaAluno: string | null;
  status: 'CORRETO' | 'ERRADO' | 'ANULADA' | 'EM_BRANCO';
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
  detalhes: QuestaoCorrecao[];
}

@Injectable()
export class SimuladosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visionOcrService: VisionOcrService,
  ) {}

  private async verifyConcursoOwner(concursoId: string, userId: string) {
    const concurso = await this.prisma.concurso.findUnique({
      where: { id: concursoId },
    });

    if (!concurso) {
      throw new NotFoundException('Concurso não encontrado');
    }

    if (concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este concurso');
    }

    return concurso;
  }

  async findByConcurso(concursoId: string, userId: string) {
    await this.verifyConcursoOwner(concursoId, userId);

    const simulados = await this.prisma.simulado.findMany({
      where: { concursoId },
      orderBy: { dataRealizacao: 'desc' },
    });

    return simulados.map((s) => ({
      ...s,
      gabaritoOficial: this.safeParseJson(s.gabaritoOficial),
      detalhes: s.detalhes ? this.safeParseJson(s.detalhes) : null,
    }));
  }

  async findOne(id: string, userId: string) {
    const simulado = await this.prisma.simulado.findUnique({
      where: { id },
      include: { concurso: true },
    });

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    if (simulado.concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este simulado');
    }

    return {
      ...simulado,
      gabaritoOficial: this.safeParseJson(simulado.gabaritoOficial),
      detalhes: simulado.detalhes ? this.safeParseJson(simulado.detalhes) : null,
    };
  }

  /**
   * Processamento da Correção entre Gabarito Oficial e Gabarito do Aluno
   */
  public calcularCorrecao(
    gabaritoOficialInput: any,
    gabaritoAlunoTexto: string,
  ): RelatorioCorrecao {
    // Normalizar Gabarito Oficial
    const oficialMap = this.normalizeOficialGabarito(gabaritoOficialInput);

    // Normalizar Gabarito do Aluno
    const alunoMap = this.visionOcrService.parseTextToGabarito(gabaritoAlunoTexto);

    // Obter todos os números de questão ordenados numericamente
    const allNumeros = Array.from(
      new Set([
        ...Object.keys(oficialMap).map((k) => parseInt(k, 10)),
        ...Object.keys(alunoMap).map((k) => parseInt(k, 10)),
      ]),
    )
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);

    let totalAcertos = 0;
    let totalErros = 0;
    let totalEmBranco = 0;
    let totalAnuladas = 0;

    const questoesErradas: RelatorioCorrecao['questoesErradas'] = [];
    const questoesCorretas: RelatorioCorrecao['questoesCorretas'] = [];
    const questoesAnuladas: number[] = [];
    const detalhes: QuestaoCorrecao[] = [];

    for (const num of allNumeros) {
      const oficialResp = (oficialMap[num.toString()] || '').toUpperCase().trim();
      const alunoResp = alunoMap[num.toString()]
        ? alunoMap[num.toString()].toUpperCase().trim()
        : null;

      let status: QuestaoCorrecao['status'];

      if (oficialResp === 'X' || oficialResp === 'ANULADA' || oficialResp === 'NULA') {
        status = 'ANULADA';
        totalAnuladas++;
        // Em concursos públicos, questão anulada geralmente concede ponto a todos
        totalAcertos++;
        questoesAnuladas.push(num);
      } else if (!alunoResp) {
        status = 'EM_BRANCO';
        totalEmBranco++;
        totalErros++;
        questoesErradas.push({
          numero: num,
          respostaAluno: null,
          respostaCorreta: oficialResp,
        });
      } else if (alunoResp === oficialResp) {
        status = 'CORRETO';
        totalAcertos++;
        questoesCorretas.push({
          numero: num,
          respostaAluno: alunoResp,
        });
      } else {
        status = 'ERRADO';
        totalErros++;
        questoesErradas.push({
          numero: num,
          respostaAluno: alunoResp,
          respostaCorreta: oficialResp,
        });
      }

      detalhes.push({
        numero: num,
        respostaOficial: oficialResp,
        respostaAluno: alunoResp,
        status,
      });
    }

    const totalQuestoes = allNumeros.length;
    const notaPercentual =
      totalQuestoes > 0 ? Number(((totalAcertos / totalQuestoes) * 100).toFixed(1)) : 0;

    return {
      totalQuestoes,
      totalAcertos,
      totalErros,
      totalEmBranco,
      totalAnuladas,
      notaPercentual,
      questoesErradas,
      questoesCorretas,
      questoesAnuladas,
      detalhes,
    };
  }

  async previewCorrecao(dto: CorrigirSimuladoDto) {
    return this.calcularCorrecao(dto.gabaritoOficial, dto.gabaritoAluno);
  }

  async create(dto: CreateSimuladoDto, userId: string) {
    await this.verifyConcursoOwner(dto.concursoId, userId);

    const relatorio = this.calcularCorrecao(dto.gabaritoOficial, dto.gabaritoAluno);

    const gabaritoOficialMap = this.normalizeOficialGabarito(dto.gabaritoOficial);

    const simulado = await this.prisma.simulado.create({
      data: {
        concursoId: dto.concursoId,
        nome: dto.nome,
        ano: dto.ano,
        dataRealizacao: new Date(dto.dataRealizacao),
        gabaritoOficial: JSON.stringify(gabaritoOficialMap),
        gabaritoAluno: dto.gabaritoAluno,
        totalAcertos: relatorio.totalAcertos,
        totalErros: relatorio.totalErros,
        totalQuestoes: relatorio.totalQuestoes,
        notaPercentual: relatorio.notaPercentual,
        detalhes: JSON.stringify(relatorio),
      },
    });

    return {
      ...simulado,
      gabaritoOficial: gabaritoOficialMap,
      detalhes: relatorio,
      relatorio,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.simulado.delete({
      where: { id },
    });
  }

  private safeParseJson(data: any) {
    if (!data || typeof data !== 'string') return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  /**
   * Normaliza o gabarito oficial (string JSON, texto cru de OCR ou objeto) para um mapa.
   */
  private normalizeOficialGabarito(input: any): Record<string, string> {
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return this.visionOcrService.parseTextToGabarito(input);
      }
    }

    if (typeof input === 'object' && input !== null) {
      return input;
    }

    return {};
  }
}

