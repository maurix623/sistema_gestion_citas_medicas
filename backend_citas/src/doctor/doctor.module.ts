import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Especialidad } from 'src/especialidad/entities/especialidad.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Consultorio } from 'src/consultorio/entities/consultorio.entity';
import { Cita } from 'src/cita/entities/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Especialidad, Usuario, Consultorio, Cita])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
