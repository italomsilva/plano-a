import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MateriasService } from './materias.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { ImportTopicosDto } from './dto/import-topicos.dto';
import { CreateTopicoDto } from './dto/create-topico.dto';
import { UpdateTopicoDto } from './dto/update-topico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, AuthenticatedUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('materias')
export class MateriasController {
  constructor(private readonly materiasService: MateriasService) {}

  @Get()
  async findByConcurso(
    @Query('concursoId') concursoId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.findByConcurso(concursoId, user.id);
  }

  @Post()
  async create(
    @Body() dto: CreateMateriaDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.create(dto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.materiasService.remove(id, user.id);
  }

  @Post(':id/topicos/importar')
  async importTopicos(
    @Param('id') id: string,
    @Body() dto: ImportTopicosDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.importTopicos(id, dto, user.id);
  }

  @Post(':id/topicos')
  async createTopico(
    @Param('id') id: string,
    @Body() dto: CreateTopicoDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.createTopico(id, dto, user.id);
  }

  @Patch('topicos/:topicoId/toggle')
  async toggleTopico(
    @Param('topicoId') topicoId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.toggleTopico(topicoId, user.id);
  }

  @Put('topicos/:topicoId')
  async updateTopico(
    @Param('topicoId') topicoId: string,
    @Body() dto: UpdateTopicoDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.updateTopico(topicoId, dto, user.id);
  }

  @Delete('topicos/:topicoId')
  async removeTopico(
    @Param('topicoId') topicoId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.materiasService.removeTopico(topicoId, user.id);
  }
}

