import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { ImportTopicosDto } from './dto/import-topicos.dto';
import { CreateTopicoDto } from './dto/create-topico.dto';
import { UpdateTopicoDto } from './dto/update-topico.dto';

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaService) {}

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

  private async verifyMateriaOwner(materiaId: string, userId: string) {
    const materia = await this.prisma.materia.findUnique({
      where: { id: materiaId },
      include: { concurso: true },
    });

    if (!materia) {
      throw new NotFoundException('Matéria não encontrada');
    }

    if (materia.concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta matéria');
    }

    return materia;
  }

  async findByConcurso(concursoId: string, userId: string) {
    await this.verifyConcursoOwner(concursoId, userId);

    const materias = await this.prisma.materia.findMany({
      where: { concursoId },
      include: {
        topicos: {
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return materias.map((materia) => {
      const total = materia.topicos.length;
      const concluidos = materia.topicos.filter((t) => t.concluido).length;
      const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;

      return {
        ...materia,
        totalTopicos: total,
        topicosConcluidos: concluidos,
        progresso,
      };
    });
  }

  async create(dto: CreateMateriaDto, userId: string) {
    await this.verifyConcursoOwner(dto.concursoId, userId);

    return this.prisma.materia.create({
      data: {
        nome: dto.nome,
        concursoId: dto.concursoId,
      },
      include: {
        topicos: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.verifyMateriaOwner(id, userId);

    return this.prisma.materia.delete({
      where: { id },
    });
  }

  /**
   * Importação via Texto Bruto (Parser de Tópicos)
   * Quebra o texto pelo delimitador ';' e sanitiza cada item.
   */
  async importTopicos(materiaId: string, dto: ImportTopicosDto, userId: string) {
    await this.verifyMateriaOwner(materiaId, userId);

    const rawList = dto.textoBruto.split(';');

    // Sanitização e limpeza de cada tópico
    const titulosLimpos = rawList
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (titulosLimpos.length === 0) {
      return { count: 0, topicos: [] };
    }

    // Obter maior ordem atual
    const maxOrdemItem = await this.prisma.topicoEstudo.findFirst({
      where: { materiaId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    let currentOrdem = (maxOrdemItem?.ordem ?? 0) + 1;

    const dataToCreate = titulosLimpos.map((titulo) => ({
      materiaId,
      titulo,
      concluido: false,
      ordem: currentOrdem++,
    }));

    await this.prisma.topicoEstudo.createMany({
      data: dataToCreate,
    });

    const topicosAtualizados = await this.prisma.topicoEstudo.findMany({
      where: { materiaId },
      orderBy: { ordem: 'asc' },
    });

    return {
      count: titulosLimpos.length,
      topicos: topicosAtualizados,
    };
  }

  async createTopico(materiaId: string, dto: CreateTopicoDto, userId: string) {
    await this.verifyMateriaOwner(materiaId, userId);

    const maxOrdemItem = await this.prisma.topicoEstudo.findFirst({
      where: { materiaId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    const nextOrdem = (maxOrdemItem?.ordem ?? 0) + 1;

    return this.prisma.topicoEstudo.create({
      data: {
        materiaId,
        titulo: dto.titulo.trim(),
        ordem: nextOrdem,
      },
    });
  }

  async updateTopico(topicoId: string, dto: UpdateTopicoDto, userId: string) {
    const topico = await this.prisma.topicoEstudo.findUnique({
      where: { id: topicoId },
      include: {
        materia: {
          include: { concurso: true },
        },
      },
    });

    if (!topico) {
      throw new NotFoundException('Tópico não encontrado');
    }

    if (topico.materia.concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este tópico');
    }

    return this.prisma.topicoEstudo.update({
      where: { id: topicoId },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.concluido !== undefined && { concluido: dto.concluido }),
        ...(dto.ordem !== undefined && { ordem: dto.ordem }),
      },
    });
  }

  async toggleTopico(topicoId: string, userId: string) {
    const topico = await this.prisma.topicoEstudo.findUnique({
      where: { id: topicoId },
      include: {
        materia: {
          include: { concurso: true },
        },
      },
    });

    if (!topico) {
      throw new NotFoundException('Tópico não encontrado');
    }

    if (topico.materia.concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.topicoEstudo.update({
      where: { id: topicoId },
      data: {
        concluido: !topico.concluido,
      },
    });
  }

  async removeTopico(topicoId: string, userId: string) {
    const topico = await this.prisma.topicoEstudo.findUnique({
      where: { id: topicoId },
      include: {
        materia: {
          include: { concurso: true },
        },
      },
    });

    if (!topico) {
      throw new NotFoundException('Tópico não encontrado');
    }

    if (topico.materia.concurso.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.prisma.topicoEstudo.delete({
      where: { id: topicoId },
    });
  }
}

