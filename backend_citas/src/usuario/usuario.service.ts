import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Paciente } from 'src/paciente/entities/paciente.entity';
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

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
  ) {}

  async findByCorreo(correo: string) {
    return await this.usuarioRepo.findOne({
      where: { correo },
      relations: { rol: true },
    });
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const rol = await this.rolRepo.findOne({
      where: { id_rol: createUsuarioDto.id_rol },
    });

    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    const correoExistente = await this.usuarioRepo.findOne({
      where: {
        correo: createUsuarioDto.correo,
      },
    });

    if (correoExistente) {
      throw new ConflictException(
        'Ya existe un usuario registrado con este correo',
      );
    }

    const passwordHash = await bcrypt.hash(createUsuarioDto.password, 10);

    const usuario = this.usuarioRepo.create({
      ...createUsuarioDto,
      password: passwordHash,
      rol,
    });

    const usuarioGuardado = await this.usuarioRepo.save(usuario);

    if (rol.nombre_rol === 'PACIENTE') {
      const paciente = this.pacienteRepo.create({
        usuario: usuarioGuardado,
      });

      await this.pacienteRepo.save(paciente);
    }

    return usuarioGuardado;
  }

  async findAll() {
    return await this.usuarioRepo.find({
      relations: { rol: true },
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
      relations: { rol: true },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.id_rol) {
      const rol = await this.rolRepo.findOne({
        where: {
          id_rol: updateUsuarioDto.id_rol,
        },
      });

      if (!rol) {
        throw new NotFoundException('Rol no encontrado');
      }

      usuario.rol = rol;
    }

    if (updateUsuarioDto.password) {
      usuario.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    usuario.nombre = updateUsuarioDto.nombre ?? usuario.nombre;
    usuario.apellido = updateUsuarioDto.apellido ?? usuario.apellido;
    usuario.correo = updateUsuarioDto.correo ?? usuario.correo;
    usuario.telefono = updateUsuarioDto.telefono ?? usuario.telefono;

    return await this.usuarioRepo.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);

    const doctorAsociado = await this.doctorRepo.findOne({
      where: { usuario: { id_usuario: usuario.id_usuario } },
      relations: { usuario: true },
    });

    if (doctorAsociado) {
      throw new ConflictException('El usuario esta asociado a un doctor');
    }

    const pacienteAsociado = await this.pacienteRepo.findOne({
      where: { usuario: { id_usuario: usuario.id_usuario } },
      relations: { usuario: true },
    });

    if (pacienteAsociado) {
      throw new ConflictException('El usuario esta asociado a un paciente');
    }

    return await this.usuarioRepo.softDelete(usuario.id_usuario);
  }
}
