import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveCronogramaDto } from './dto/save-cronograma.dto';

@Injectable()
export class CronogramaService {
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

  async findByConcurso(concursoId: string, userId: string) {
    await this.verifyConcursoOwner(concursoId, userId);

    const items = await this.prisma.cronogramaItem.findMany({
      where: { concursoId },
      orderBy: [{ linhaIndex: 'asc' }, { diaSemana: 'asc' }],
    });

    // Encontrar o maior linhaIndex para determinar o total de linhas
    let maxLinha = 3; // Pelo menos 4 linhas por padrão (índices 0, 1, 2, 3)
    items.forEach((it) => {
      if (it.linhaIndex > maxLinha) {
        maxLinha = it.linhaIndex;
      }
    });

    return {
      totalLinhas: maxLinha + 1,
      items,
    };
  }

  async saveAll(dto: SaveCronogramaDto, userId: string) {
    await this.verifyConcursoOwner(dto.concursoId, userId);

    // Usa transação para deletar os anteriores e inserir os novos
    await this.prisma.$transaction(async (tx) => {
      await tx.cronogramaItem.deleteMany({
        where: { concursoId: dto.concursoId },
      });

      if (dto.items && dto.items.length > 0) {
        await tx.cronogramaItem.createMany({
          data: dto.items.map((item) => ({
            concursoId: dto.concursoId,
            diaSemana: item.diaSemana,
            linhaIndex: item.linhaIndex,
            conteudo: item.conteudo || '',
            corFundo: item.corFundo || '#ffffff',
          })),
        });
      }
    });

    return this.findByConcurso(dto.concursoId, userId);
  }

  async upsertCell(
    concursoId: string,
    diaSemana: number,
    linhaIndex: number,
    conteudo: string,
    corFundo: string,
    userId: string,
  ) {
    await this.verifyConcursoOwner(concursoId, userId);

    const existing = await this.prisma.cronogramaItem.findFirst({
      where: {
        concursoId,
        diaSemana,
        linhaIndex,
      },
    });

    if (existing) {
      return this.prisma.cronogramaItem.update({
        where: { id: existing.id },
        data: {
          conteudo,
          corFundo: corFundo || '#ffffff',
        },
      });
    }

    return this.prisma.cronogramaItem.create({
      data: {
        concursoId,
        diaSemana,
        linhaIndex,
        conteudo,
        corFundo: corFundo || '#ffffff',
      },
    });
  }

  async clear(concursoId: string, userId: string) {
    await this.verifyConcursoOwner(concursoId, userId);

    await this.prisma.cronogramaItem.deleteMany({
      where: { concursoId },
    });

    return { success: true, message: 'Cronograma limpo com sucesso' };
  }
}

