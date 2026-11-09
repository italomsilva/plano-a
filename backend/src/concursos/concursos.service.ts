import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConcursoDto } from './dto/create-concurso.dto';
import { UpdateConcursoDto } from './dto/update-concurso.dto';

@Injectable()
export class ConcursosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    const concursos = await this.prisma.concurso.findMany({
      where: { userId },
      orderBy: { dataProva: 'asc' },
      include: {
        materias: {
          include: {
            topicos: true,
          },
        },
        simulados: {
          select: {
            id: true,
            totalAcertos: true,
            totalErros: true,
            totalQuestoes: true,
            notaPercentual: true,
          },
        },
      },
    });

    return concursos.map((concurso) => {
      let totalTopicos = 0;
      let topicosConcluidos = 0;

      concurso.materias.forEach((m) => {
        totalTopicos += m.topicos.length;
        topicosConcluidos += m.topicos.filter((t) => t.concluido).length;
      });

      const progressoEstudo =
        totalTopicos > 0 ? Math.round((topicosConcluidos / totalTopicos) * 100) : 0;

      const totalSimulados = concurso.simulados.length;
      const mediaSimulados =
        totalSimulados > 0
          ? Math.round(
              concurso.simulados.reduce((acc, s) => acc + s.notaPercentual, 0) /
                totalSimulados,
            )
          : 0;

      return {
        id: concurso.id,
        nome: concurso.nome,
        orgao: concurso.orgao,
        dataProva: concurso.dataProva,
        dataResultado: concurso.dataResultado,
        createdAt: concurso.createdAt,
        totalMaterias: concurso.materias.length,
        totalTopicos,
        topicosConcluidos,
        progressoEstudo,
        totalSimulados,
        mediaSimulados,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const concurso = await this.prisma.concurso.findUnique({
      where: { id },
      include: {
        materias: {
          include: {
            topicos: {
              orderBy: { ordem: 'asc' },
            },
          },
        },
        simulados: {
          orderBy: { dataRealizacao: 'desc' },
        },
        cronograma: {
          orderBy: [{ linhaIndex: 'asc' }, { diaSemana: 'asc' }],
        },
      },
    });

    if (!concurso) {
      throw new NotFoundException('Concurso não encontrado');
    }

    if (concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este concurso');
    }

    let totalTopicos = 0;
    let topicosConcluidos = 0;

    concurso.materias.forEach((m) => {
      totalTopicos += m.topicos.length;
      topicosConcluidos += m.topicos.filter((t) => t.concluido).length;
    });

    const progressoEstudo =
      totalTopicos > 0 ? Math.round((topicosConcluidos / totalTopicos) * 100) : 0;

    // Métricas de simulado também no detalhe (usadas pelo dashboard
    // para as regras de exibição do card "Próximo Passo"):
    const totalSimulados = concurso.simulados.length;
    const mediaSimulados =
      totalSimulados > 0
        ? Math.round(
            concurso.simulados.reduce((acc, s) => acc + s.notaPercentual, 0) /
              totalSimulados,
          )
        : 0;

    return {
      ...concurso,
      totalTopicos,
      topicosConcluidos,
      progressoEstudo,
      totalSimulados,
      mediaSimulados,
    };
  }

  async create(dto: CreateConcursoDto, userId: string) {
    return this.prisma.concurso.create({
      data: {
        nome: dto.nome,
        orgao: dto.orgao,
        dataProva: new Date(dto.dataProva),
        dataResultado: dto.dataResultado ? new Date(dto.dataResultado) : null,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateConcursoDto, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.concurso.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.orgao && { orgao: dto.orgao }),
        ...(dto.dataProva && { dataProva: new Date(dto.dataProva) }),
        ...(dto.dataResultado !== undefined && {
          dataResultado: dto.dataResultado ? new Date(dto.dataResultado) : null,
        }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.concurso.delete({
      where: { id },
    });
  }
}

