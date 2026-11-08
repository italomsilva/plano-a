import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome de usuário é obrigatório' })
  @MinLength(3, { message: 'O nome de usuário deve ter no mínimo 3 caracteres' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(4, { message: 'A senha deve ter no mínimo 4 caracteres' })
  password: string;
}

