import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateConcursoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  orgao?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data da prova deve ser uma data válida' })
  dataProva?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data do resultado deve ser uma data válida' })
  dataResultado?: string;
}

