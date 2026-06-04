import { Module } from '@nestjs/common';
import { ConsultorioService } from './consultorio.service';
import { ConsultorioController } from './consultorio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultorio } from './entities/consultorio.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Consultorio])],
  controllers: [ConsultorioController],
  providers: [ConsultorioService],
})
export class ConsultorioModule {}
