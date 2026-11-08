import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do concurso é obrigatório' })
  concursoId: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome da matéria é obrigatório' })
  nome: string;
}

