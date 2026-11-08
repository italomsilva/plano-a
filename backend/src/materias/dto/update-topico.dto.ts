import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTopicoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsBoolean()
  concluido?: boolean;

  @IsOptional()
  @IsNumber()
  ordem?: number;
}

