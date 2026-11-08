import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ConcursosService } from './concursos.service';
import { CreateConcursoDto } from './dto/create-concurso.dto';
import { UpdateConcursoDto } from './dto/update-concurso.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser, AuthenticatedUser } from '../auth/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('concursos')
export class ConcursosController {
  constructor(private readonly concursosService: ConcursosService) {}

  @Get()
  async findAll(@GetUser() user: AuthenticatedUser) {
    return this.concursosService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.concursosService.findOne(id, user.id);
  }

  @Post()
  async create(
    @Body() dto: CreateConcursoDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.concursosService.create(dto, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConcursoDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.concursosService.update(id, dto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.concursosService.remove(id, user.id);
  }
}

