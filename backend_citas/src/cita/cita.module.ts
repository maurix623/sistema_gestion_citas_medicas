import { Module } from '@nestjs/common';
import { CitaService } from './cita.service';
import { CitaController } from './cita.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Paciente } from 'src/paciente/entities/paciente.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { HorarioAtencion } from 'src/horario_atencion/entities/horario_atencion.entity';
import { SignoVital } from 'src/signo_vital/entities/signo_vital.entity';
import { HistoriaClinica } from 'src/historia_clinica/entities/historia_clinica.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Paciente, Doctor, HorarioAtencion, SignoVital, HistoriaClinica])],
  controllers: [CitaController],
  providers: [CitaService],
})
export class CitaModule {}
