import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CronogramaService } from './cronograma.service';
import { SaveCronogramaDto } from './dto/save-cronograma.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, AuthenticatedUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cronograma')
export class CronogramaController {
  constructor(private readonly cronogramaService: CronogramaService) {}

  @Get()
  async findByConcurso(
    @Query('concursoId') concursoId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.cronogramaService.findByConcurso(concursoId, user.id);
  }

  @Post('save')
  async saveAll(
    @Body() dto: SaveCronogramaDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.cronogramaService.saveAll(dto, user.id);
  }

  @Put('cell')
  async upsertCell(
    @Body()
    body: {
      concursoId: string;
      diaSemana: number;
      linhaIndex: number;
      conteudo: string;
      corFundo: string;
    },
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.cronogramaService.upsertCell(
      body.concursoId,
      body.diaSemana,
      body.linhaIndex,
      body.conteudo,
      body.corFundo,
      user.id,
    );
  }

  @Delete('clear')
  async clear(
    @Query('concursoId') concursoId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.cronogramaService.clear(concursoId, user.id);
  }
}

