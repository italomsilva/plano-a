import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

// Reaproveita o DTO de questão do create (evita duplicação de validação)
import { QuestaoGabaritoDto } from './create-simulado.dto';
import { IsGabaritoInput } from './gabarito-input.decorator';
export { QuestaoGabaritoDto };

export class CorrigirSimuladoDto {
  @IsGabaritoInput({ message: 'O gabarito oficial deve ser um objeto {"1":"A"} ou um array de questões [{ numero, alternativa }]' })
  @IsNotEmpty({ message: 'O gabarito oficial é obrigatório' })
  gabaritoOficial: Record<string, string> | QuestaoGabaritoDto[];

  @IsString()
  @IsNotEmpty({ message: 'O gabarito do aluno é obrigatório' })
  gabaritoAluno: string;
}

