import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConcursosModule } from './concursos/concursos.module';
import { MateriasModule } from './materias/materias.module';
import { SimuladosModule } from './simulados/simulados.module';
import { CronogramaModule } from './cronograma/cronograma.module';
import { VisionOcrModule } from './vision-ocr/vision-ocr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ConcursosModule,
    MateriasModule,
    SimuladosModule,
    CronogramaModule,
    VisionOcrModule,
  ],
})
export class AppModule {}

