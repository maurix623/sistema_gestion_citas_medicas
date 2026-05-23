import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ){};

  async create(createRolDto: CreateRolDto) {
    const nuevoRol= this.rolRepo.create(createRolDto)
    return await this.rolRepo.save(nuevoRol);
  }

  async findAll() {
    return await this.rolRepo.find();
  }

  async findOne(id: number) {
    const rol = await this.rolRepo.findOneBy({id_rol: id });

    if(!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const rol = await this.findOne(id);
    Object.assign(rol, updateRolDto);
    return await this.rolRepo.save(rol);
  }

  async remove(id: number) {
    const rol = await this.findOne(id);
    return await this.rolRepo.remove(rol);
  }
}
