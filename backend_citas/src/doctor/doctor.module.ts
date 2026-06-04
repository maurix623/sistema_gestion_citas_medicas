import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Especialidad } from 'src/especialidad/entities/especialidad.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Especialidad, Usuario])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
