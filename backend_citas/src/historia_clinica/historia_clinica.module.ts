import { Module } from '@nestjs/common';
import { HistoriaClinicaService } from './historia_clinica.service';
import { HistoriaClinicaController } from './historia_clinica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaClinica } from './entities/historia_clinica.entity';
import { Cita } from 'src/cita/entities/cita.entity';
import { SignoVital } from 'src/signo_vital/entities/signo_vital.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriaClinica, Cita, SignoVital])],
  controllers: [HistoriaClinicaController],
  providers: [HistoriaClinicaService],
})
export class HistoriaClinicaModule {}
