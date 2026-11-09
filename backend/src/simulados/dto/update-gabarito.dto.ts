import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestaoGabaritoDto } from './create-simulado.dto';
import { IsGabaritoInput } from './gabarito-input.decorator';

/**
 * Usado em PUT /simulados/:id/gabarito
 * Permite adicionar, editar e remover questões do gabarito oficial de um
 * simulado já criado, recalculando a correção automaticamente.
 *
 * - gabaritoOficial: lista completa de questões do gabarito (o que não for
 *   enviado é removido) ou objeto legado {"1": "A"}.
 * - gabaritoAluno: opcional; se omitido, mantém o gabarito do aluno atual.
 */
export class UpdateGabaritoDto {
  @IsGabaritoInput({ message: 'O gabarito oficial deve ser um objeto {"1":"A"} ou um array de questões [{ numero, alternativa }]' })
  @IsNotEmpty({ message: 'O gabarito oficial é obrigatório' })
  gabaritoOficial: Record<string, string> | QuestaoGabaritoDto[];

  @IsOptional()
  @IsString({ message: 'O gabarito do aluno deve ser um texto' })
  @IsNotEmpty({ message: 'O gabarito do aluno não pode ficar vazio' })
  gabaritoAluno?: string;
}
