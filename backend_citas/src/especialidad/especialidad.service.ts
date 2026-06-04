import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Especialidad } from './entities/especialidad.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EspecialidadService {
  constructor(
    @InjectRepository(Especialidad)
    private readonly especialidadRepo: Repository<Especialidad>,
  ){};

  async create(createEspecialidadDto: CreateEspecialidadDto) {
    const especialidad = this.especialidadRepo.create(createEspecialidadDto);
    return await this.especialidadRepo.save(especialidad);
  }

  async findAll() {
    return await this.especialidadRepo.find();
  }

  async findOne(id: number) {
    const espe = await this.especialidadRepo.findOneBy({id_especialidad: id});
    if(!espe) throw new NotFoundException('Especialidad no encontrada'); 
    return espe;
  }

  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto) {
    const especialidad = await this.findOne(id);
    Object.assign(especialidad, updateEspecialidadDto);
    return await this.especialidadRepo.save(especialidad);
  }

  async remove(id: number) {
    const especialidad = await this.findOne(id);
    return await this.especialidadRepo.softDelete(id);
  }
}
