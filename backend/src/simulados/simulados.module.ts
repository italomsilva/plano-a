import { Module } from '@nestjs/common';
import { SimuladosService } from './simulados.service';
import { SimuladosController } from './simulados.controller';
import { VisionOcrModule } from '../vision-ocr/vision-ocr.module';

@Module({
  imports: [VisionOcrModule],
  controllers: [SimuladosController],
  providers: [SimuladosService],
  exports: [SimuladosService],
})
export class SimuladosModule {}

