import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Paciente } from 'src/paciente/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol, Doctor, Paciente])],
  exports: [UsuarioService],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
