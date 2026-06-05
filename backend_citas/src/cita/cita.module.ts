import { Module } from '@nestjs/common';
import { CitaService } from './cita.service';
import { CitaController } from './cita.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Paciente } from 'src/paciente/entities/paciente.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { HorarioAtencion } from 'src/horario_atencion/entities/horario_atencion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Paciente, Doctor, HorarioAtencion])],
  controllers: [CitaController],
  providers: [CitaService],
})
export class CitaModule {}
