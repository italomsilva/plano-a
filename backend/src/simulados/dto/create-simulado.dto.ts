import {
  IsDateString,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsGabaritoInput } from './gabarito-input.decorator';

export const ALTERNATIVAS_VALIDAS = ['A', 'B', 'C', 'D', 'E', 'X'];

export class QuestaoGabaritoDto {
  @IsInt({ message: 'O número da questão deve ser um inteiro positivo' })
  @Min(1, { message: 'O número da questão deve ser maior que zero' })
  @Max(1000, { message: 'O número da questão deve ser no máximo 1000' })
  @IsNotEmpty({ message: 'O número da questão é obrigatório' })
  numero: number;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'A alternativa é obrigatória' })
  @IsIn(ALTERNATIVAS_VALIDAS, {
    message: 'A alternativa deve ser uma das opções válidas: A, B, C, D, E ou X (anulada)',
  })
  alternativa: string; // A, B, C, D, E, X (anulada)
}

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

  // Gabarito Oficial como array de questões (formato novo) ou objeto {"1": "A"} (formato legado)
  @IsGabaritoInput({ message: 'O gabarito oficial deve ser um objeto {"1":"A"} ou um array de questões [{ numero, alternativa }]' })
  @IsNotEmpty({ message: 'O gabarito oficial é obrigatório' })
  gabaritoOficial: Record<string, string> | QuestaoGabaritoDto[];

  // Gabarito do aluno no formato "1-A\n2-B"
  @IsString()
  @IsNotEmpty({ message: 'O gabarito do aluno é obrigatório' })
  gabaritoAluno: string;
}

