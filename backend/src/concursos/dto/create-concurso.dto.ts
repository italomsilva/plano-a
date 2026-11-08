import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConcursoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do concurso é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O órgão é obrigatório' })
  orgao: string;

  @IsDateString({}, { message: 'Data da prova deve ser uma data válida (ISO 8601)' })
  @IsNotEmpty({ message: 'A data da prova é obrigatória' })
  dataProva: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data do resultado deve ser uma data válida (ISO 8601)' })
  dataResultado?: string;
}

