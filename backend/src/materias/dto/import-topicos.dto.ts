import { IsNotEmpty, IsString } from 'class-validator';

export class ImportTopicosDto {
  @IsString()
  @IsNotEmpty({ message: 'O texto bruto com tópicos é obrigatório' })
  textoBruto: string;
}

