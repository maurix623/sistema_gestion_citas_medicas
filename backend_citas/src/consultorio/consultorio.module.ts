import { Module } from '@nestjs/common';
import { ConsultorioService } from './consultorio.service';
import { ConsultorioController } from './consultorio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultorio } from './entities/consultorio.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Consultorio, Doctor])],
  controllers: [ConsultorioController],
  providers: [ConsultorioService],
})
export class ConsultorioModule {}
