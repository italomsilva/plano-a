import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSimuladoDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do concurso é obrigatório' })
  concursoId: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome do simulado é obrigatório' })
  nome: string;

  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O ano é obrigatório' })
  ano: number;

  @IsDateString({}, { message: 'A data de realização deve ser uma data válida' })
  @IsNotEmpty({ message: 'A data de realização é obrigatória' })
  dataRealizacao: string;

  // Gabarito Oficial pode vir como objeto {"1": "A"} ou string JSON
  @IsNotEmpty({ message: 'O gabarito oficial é obrigatório' })
  gabaritoOficial: any;

  // Gabarito do aluno no formato "1-A\n2-B"
  @IsString()
  @IsNotEmpty({ message: 'O gabarito do aluno é obrigatório' })
  gabaritoAluno: string;
}

