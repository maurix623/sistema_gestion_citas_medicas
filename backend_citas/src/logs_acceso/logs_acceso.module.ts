import { Module } from '@nestjs/common';
import { LogsAccesoService } from './logs_acceso.service';
import { LogsAccesoController } from './logs_acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAcceso } from './entities/logs_acceso.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogAcceso, Usuario])],
  controllers: [LogsAccesoController],
  providers: [LogsAccesoService],
  exports: [LogsAccesoService]
})
export class LogsAccesoModule {}
