import { Module } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { PacienteController } from './paciente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Cita } from 'src/cita/entities/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, Usuario, Cita])],
  controllers: [PacienteController],
  providers: [PacienteService],
})
export class PacienteModule {}
