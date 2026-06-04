import { Module } from '@nestjs/common';
import { HorarioAtencionService } from './horario_atencion.service';
import { HorarioAtencionController } from './horario_atencion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioAtencion } from './entities/horario_atencion.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HorarioAtencion, Doctor])],
  controllers: [HorarioAtencionController],
  providers: [HorarioAtencionService],
})
export class HorarioAtencionModule {}
