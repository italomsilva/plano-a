import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SimuladosService } from './simulados.service';
import { CreateSimuladoDto } from './dto/create-simulado.dto';
import { CorrigirSimuladoDto } from './dto/corrigir-simulado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, AuthenticatedUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('simulados')
export class SimuladosController {
  constructor(private readonly simuladosService: SimuladosService) {}

  @Get()
  async findByConcurso(
    @Query('concursoId') concursoId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.simuladosService.findByConcurso(concursoId, user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.simuladosService.findOne(id, user.id);
  }

  @Post()
  async create(
    @Body() dto: CreateSimuladoDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.simuladosService.create(dto, user.id);
  }

  @Post('preview-correcao')
  async previewCorrecao(@Body() dto: CorrigirSimuladoDto) {
    return this.simuladosService.previewCorrecao(dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.simuladosService.remove(id, user.id);
  }
}

