import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CronogramaCellDto {
  @IsInt()
  diaSemana: number; // 0 a 6

  @IsInt()
  linhaIndex: number; // 0 em diante

  @IsString()
  conteudo: string;

  @IsOptional()
  @IsString()
  corFundo?: string;
}

export class SaveCronogramaDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do concurso é obrigatório' })
  concursoId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CronogramaCellDto)
  items: CronogramaCellDto[];
}

