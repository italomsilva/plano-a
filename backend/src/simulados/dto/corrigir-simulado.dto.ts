import { IsNotEmpty, IsString } from 'class-validator';

export class CorrigirSimuladoDto {
  @IsNotEmpty({ message: 'O gabarito oficial é obrigatório' })
  gabaritoOficial: any;

  @IsString()
  @IsNotEmpty({ message: 'O gabarito do aluno é obrigatório' })
  gabaritoAluno: string;
}

