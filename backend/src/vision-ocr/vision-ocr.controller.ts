import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VisionOcrService } from './vision-ocr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vision-ocr')
export class VisionOcrController {
  constructor(private readonly visionOcrService: VisionOcrService) {}

  @Post('parse-image')
  @UseInterceptors(FileInterceptor('image'))
  async parseImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de imagem enviado');
    }

    return this.visionOcrService.parseImage(file.buffer, file.mimetype);
  }

  @Post('parse-text')
  async parseText(@Body('text') text: string) {
    if (!text) {
      throw new BadRequestException('Texto para análise é obrigatório');
    }

    const gabarito = this.visionOcrService.parseTextToGabarito(text);
    return {
      success: Object.keys(gabarito).length > 0,
      gabarito,
      totalQuestoes: Object.keys(gabarito).length,
    };
  }
}

