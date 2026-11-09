import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimuladoDto } from './dto/create-simulado.dto';
import { CorrigirSimuladoDto } from './dto/corrigir-simulado.dto';
import { UpdateGabaritoDto } from './dto/update-gabarito.dto';
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
  private readonly logger = new Logger(SimuladosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visionOcrService: VisionOcrService,
  ) {}

  /**
   * Envolve as operações de persistência para:
   * - Registrar logs detalhados (operação + stack) no servidor;
   * - Converter erros do Prisma em respostas HTTP claras
   *   (BadRequest/Conflict/NotFound em vez de 500 genérico).
   */
  private async persistirComLog<T>(operacao: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof ConflictException || err instanceof InternalServerErrorException) {
        throw err;
      }

      this.logger.error(
        `Falha em ${operacao}: ${err?.message}`,
        err?.stack,
      );

      switch (err?.code) {
        case 'P2002': // Unique constraint
          throw new ConflictException(
            'Registro duplicado no banco de dados. Verifique os dados inseridos e tente novamente.',
          );
        case 'P2003': // Foreign key
          throw new BadRequestException(
            'Registro relacionado não encontrado. Atualize a página e tente novamente.',
          );
        case 'P2000': // Valores fora do limite da coluna
          throw new BadRequestException(
            'Os dados salvos excederam o limite de tamanho do campo. Reduza o conteúdo e tente novamente.',
          );
        case 'P2025': // Registro de destino não encontrado
          throw new NotFoundException('Simulado não encontrado. Ele pode ter sido excluído.');
        default:
          throw new InternalServerErrorException(
            'Erro interno ao salvar os dados do simulado. Tente novamente em instantes.',
          );
      }
    }
  }

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

  /**
   * Valida as questões do gabarito oficial:
   * - Impede números de questões duplicados
   * - Limita as alternativas às opções válidas (A, B, C, D, E, X para anulada)
   * Transforma o input (objeto legado {"1":"A"} ou array de QuestaoGabaritoDto) num mapa.
   */
  private validarEGarantirMapaOficial(gabaritoOficialInput: any): Record<string, string> {
    const ALTERNATIVAS_VALIDAS = ['A', 'B', 'C', 'D', 'E', 'X'];

    let itens: Array<{ numero: number; alternativa: string }>;

    if (Array.isArray(gabaritoOficialInput)) {
      // Novo formato: array de { numero, alternativa }
      itens = gabaritoOficialInput.map((item: any) => ({
        numero: Number(item.numero),
        alternativa: String(item.alternativa).toUpperCase().trim(),
      }));
    } else if (typeof gabaritoOficialInput === 'object' && gabaritoOficialInput !== null) {
      // Formato legado: objeto {"1": "A", "2": "B"}
      itens = Object.entries(gabaritoOficialInput).map(([numero, alternativa]) => ({
        numero: Number(numero),
        alternativa: String(alternativa).toUpperCase().trim(),
      }));
    } else {
      return this.normalizeOficialGabarito(gabaritoOficialInput);
    }

    // Validar alternativas
    for (const item of itens) {
      if (!ALTERNATIVAS_VALIDAS.includes(item.alternativa)) {
        this.logger.warn(
          `Rejeitado gabarito: alternativa inválida "${item.alternativa}" na questão ${item.numero}.`,
        );
        throw new BadRequestException(
          `Alternativa inválida "${item.alternativa}" na questão ${item.numero}. Use apenas: A, B, C, D, E ou X (anulada).`,
        );
      }
      if (!item.numero || item.numero <= 0 || Number.isNaN(item.numero)) {
        this.logger.warn(
          `Rejeitado gabarito: número de questão inválido "${item.numero}".`,
        );
        throw new BadRequestException(
          `Número da questão inválido "${item.numero}". Deve ser um inteiro positivo.`,
        );
      }
    }

    // Validar duplicidade de números
    const numeros = itens.map((i) => i.numero);
    const duplicados = numeros.filter((n, i) => numeros.indexOf(n) !== i);
    if (duplicados.length > 0) {
      this.logger.warn(
        `Rejeitado gabarito: questões duplicadas ${[...new Set(duplicados)].join(', ')}.`,
      );
      throw new BadRequestException(
        `Questões duplicadas encontradas: ${[...new Set(duplicados)].join(', ')}. Informe cada número de questão apenas uma vez.`,
      );
    }

    // Montar mapa {"1": "A", ...}
    const mapa: Record<string, string> = {};
    for (const item of itens) {
      mapa[item.numero.toString()] = item.alternativa;
    }

    return mapa;
  }

  async previewCorrecao(dto: CorrigirSimuladoDto) {
    // Valida e normaliza o gabarito oficial (aceita array de questões ou objeto legado)
    const gabaritoOficialMap = this.validarEGarantirMapaOficial(dto.gabaritoOficial);
    return this.calcularCorrecao(gabaritoOficialMap, dto.gabaritoAluno);
  }

  async create(dto: CreateSimuladoDto, userId: string) {
    await this.verifyConcursoOwner(dto.concursoId, userId);

    // Valida e normaliza o gabarito oficial (aceita array de questões ou objeto legado)
    const gabaritoOficialMap = this.validarEGarantirMapaOficial(dto.gabaritoOficial);

    const relatorio = this.calcularCorrecao(gabaritoOficialMap, dto.gabaritoAluno);

    const simulado = await this.persistirComLog('create-simulado', () =>
      this.prisma.simulado.create({
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
      }),
    );

    return {
      ...simulado,
      gabaritoOficial: gabaritoOficialMap,
      detalhes: relatorio,
      relatorio,
    };
  }

  async updateGabarito(id: string, dto: UpdateGabaritoDto, userId: string) {
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

    // Valida e normaliza o gabarito oficial:
    // impede duplicados, alternativas inválidas e números <= 0.
    // A lista enviada substitui por completo o gabarito anterior
    // (o que não for enviado é removido).
    const gabaritoOficialMap = this.validarEGarantirMapaOficial(dto.gabaritoOficial);

    // Se o gabarito do aluno não for enviado, mantém o atual
    const gabaritoAluno =
      dto.gabaritoAluno !== undefined ? dto.gabaritoAluno : simulado.gabaritoAluno;

    const relatorio = this.calcularCorrecao(gabaritoOficialMap, gabaritoAluno);

    // Validação de negócio de adicionar/alterar questões:
    // loga o resumo da operação para facilitar diagnóstico
    this.logger.log(
      `Atualizando gabarito do simulado ${id}: ${Object.keys(gabaritoOficialMap).length} questões no gabarito oficial.`,
    );

    const simuladoAtualizado = await this.persistirComLog('update-gabarito', () =>
      this.prisma.simulado.update({
        where: { id },
        data: {
          gabaritoOficial: JSON.stringify(gabaritoOficialMap),
          gabaritoAluno,
          totalAcertos: relatorio.totalAcertos,
          totalErros: relatorio.totalErros,
          totalQuestoes: relatorio.totalQuestoes,
          notaPercentual: relatorio.notaPercentual,
          detalhes: JSON.stringify(relatorio),
        },
      }),
    );

    return {
      ...simuladoAtualizado,
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

