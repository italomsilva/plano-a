import { IsOptional, IsString } from 'class-validator';

export class UpdateCronogramaItemDto {
  @IsOptional()
  @IsString()
  conteudo?: string;

  @IsOptional()
  @IsString()
  corFundo?: string;
}

