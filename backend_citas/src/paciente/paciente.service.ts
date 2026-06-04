import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class PacienteService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>
  ){};
  async create(createPacienteDto: CreatePacienteDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: {id_usuario: createPacienteDto.id_usuario}
    })
    if(!usuario) throw new NotFoundException('Usuario no encontrado');

    const pacienteExistente= await this.pacienteRepo.findOne({
      where: {usuario: {id_usuario: createPacienteDto.id_usuario}}
    })
    if(pacienteExistente) throw new ConflictException('Este usuario ya esta registrado como paciente');

    const paciente =  this.pacienteRepo.create({
      ...createPacienteDto,
      usuario
    })
    return await this.pacienteRepo.save(paciente);
  }

  async findAll() {
    return await this.pacienteRepo.find({
      relations: {usuario: true}
    })
  }

  async findOne(id: number) {
    const paciente = await this.pacienteRepo.findOne({
      where: {id_paciente: id},
      relations: {usuario: true}
    })
    if(!paciente) throw new NotFoundException('Paciente no encontrado');

    return paciente;
  }

  async update(id: number, updatePacienteDto: UpdatePacienteDto) {
    const paciente = await this.findOne(id);
    Object.assign(paciente, updatePacienteDto);
    return await this.pacienteRepo.save(paciente)
  }

  async remove(id: number) {
    const paciente = await this.findOne(id);
    return await this.pacienteRepo.softDelete(paciente.id_paciente);
  }
}
