import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogAcceso } from './entities/logs_acceso.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { EventoAcceso } from './enums/evento-acceso.enum';
import { Repository } from 'typeorm';

@Injectable()
export class LogsAccesoService {
  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepo: Repository<LogAcceso>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async registrarEvento(id_usuario: number,ip: string,browser: string,evento: EventoAcceso) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const log = this.logRepo.create({ ip, browser, evento, usuario });
    return await this.logRepo.save(log);
  }

  async findAll() {
    return await this.logRepo.find({
      relations: { usuario: { rol: true } },
      order: { fecha_hora: 'DESC' },
    });
  }

  async findOne(id: number) {
    const log = await this.logRepo.findOne({
      where: {id_log: id},
      relations: {usuario: {rol: true}},
    });

    if (!log) {throw new NotFoundException('Log de acceso no encontrado');}
    return log;
  }
}
