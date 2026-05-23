import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {};

  async findByCorreo(correo: string){
    return await this.usuarioRepo.findOne({
      where: {correo},
      relations: {rol:true}
    })
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const rol = await this.rolRepo.findOne({
      where: {id_rol: createUsuarioDto.id_rol}
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    const passwordHash = await bcrypt.hash(createUsuarioDto.password, 10);

    const usuario = this.usuarioRepo.create({
      ...createUsuarioDto,
      password: passwordHash,
      rol,  //typeORM trabaja con objetos relacionados
    });
    return await this.usuarioRepo.save(usuario);
  }

  async findAll() {
    return await this.usuarioRepo.find({
      relations: {rol: true},
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: {id_usuario: id,},
      relations: {rol: true},
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async update(id: number,updateUsuarioDto: UpdateUsuarioDto,) {
    const usuario = await this.findOne(id);
    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepo.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    return await this.usuarioRepo.softDelete(usuario.id_usuario);
  }
}
 