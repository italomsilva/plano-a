import { Module } from '@nestjs/common';
import { VisionOcrService } from './vision-ocr.service';
import { VisionOcrController } from './vision-ocr.controller';

@Module({
  controllers: [VisionOcrController],
  providers: [VisionOcrService],
  exports: [VisionOcrService],
})
export class VisionOcrModule {}

