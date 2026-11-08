import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTopicoDto {
  @IsString()
  @IsNotEmpty({ message: 'O título do tópico é obrigatório' })
  titulo: string;
}

