import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Doctor } from './entities/doctor.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Especialidad } from 'src/especialidad/entities/especialidad.entity';
import { Consultorio } from 'src/consultorio/entities/consultorio.entity';
import { Cita } from 'src/cita/entities/cita.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Especialidad)
    private readonly especialidadRepo: Repository<Especialidad>,

    @InjectRepository(Consultorio)
    private readonly consultorioRepo: Repository<Consultorio>,

    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: {
        id_usuario: createDoctorDto.id_usuario,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const especialidad = await this.especialidadRepo.findOne({
      where: {
        id_especialidad: createDoctorDto.id_especialidad,
      },
    });

    if (!especialidad) {
      throw new NotFoundException('Especialidad no encontrada');
    }

    const consultorio = await this.consultorioRepo.findOne({
      where: {
        id_consultorio: createDoctorDto.id_consultorio,
      },
    });

    if (!consultorio) {
      throw new NotFoundException('Consultorio no encontrado');
    }

    const doctorPorUsuario = await this.doctorRepo.findOne({
      where: {
        usuario: {
          id_usuario: createDoctorDto.id_usuario,
        },
      },
      relations: {
        usuario: true,
      },
    });

    if (doctorPorUsuario) {
      throw new ConflictException(
        'Este usuario ya está registrado como doctor',
      );
    }

    const doctorPorMatricula = await this.doctorRepo.findOne({
      where: {
        matricula: createDoctorDto.matricula,
      },
    });

    if (doctorPorMatricula) {
      throw new ConflictException('Ya existe un doctor con esa matrícula');
    }

    const doctor = this.doctorRepo.create({
      matricula: createDoctorDto.matricula,
      descripcion: createDoctorDto.descripcion,
      usuario,
      especialidad,
      consultorio,
    });

    return await this.doctorRepo.save(doctor);
  }

  async findAll() {
    return await this.doctorRepo.find({
      relations: {
        usuario: true,
        especialidad: true,
        consultorio: true,
      },
    });
  }

  async findOne(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: {
        id_doctor: id,
      },
      relations: {
        usuario: true,
        especialidad: true,
        consultorio: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    if (updateDoctorDto.id_usuario) {
      const usuario = await this.usuarioRepo.findOne({
        where: {
          id_usuario: updateDoctorDto.id_usuario,
        },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const doctorExistente = await this.doctorRepo.findOne({
        where: {
          usuario: {
            id_usuario: updateDoctorDto.id_usuario,
          },
        },
        relations: {
          usuario: true,
        },
      });

      if (doctorExistente && doctorExistente.id_doctor !== doctor.id_doctor) {
        throw new ConflictException(
          'Este usuario ya está registrado como doctor',
        );
      }

      doctor.usuario = usuario;
    }

    if (updateDoctorDto.id_especialidad) {
      const especialidad = await this.especialidadRepo.findOne({
        where: {
          id_especialidad: updateDoctorDto.id_especialidad,
        },
      });

      if (!especialidad) {
        throw new NotFoundException('Especialidad no encontrada');
      }

      doctor.especialidad = especialidad;
    }

    if (updateDoctorDto.id_consultorio) {
      const consultorio = await this.consultorioRepo.findOne({
        where: {
          id_consultorio: updateDoctorDto.id_consultorio,
        },
      });

      if (!consultorio) {
        throw new NotFoundException('Consultorio no encontrado');
      }

      doctor.consultorio = consultorio;
    }

    if (updateDoctorDto.matricula) {
      const doctorExistente = await this.doctorRepo.findOne({
        where: {
          matricula: updateDoctorDto.matricula,
        },
      });

      if (doctorExistente && doctorExistente.id_doctor !== doctor.id_doctor) {
        throw new ConflictException('Ya existe un doctor con esa matrícula');
      }

      doctor.matricula = updateDoctorDto.matricula;
    }

    if (updateDoctorDto.descripcion !== undefined) {
      doctor.descripcion = updateDoctorDto.descripcion;
    }

    return await this.doctorRepo.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);

    const citaAsociada = await this.citaRepo.findOne({
      where: { doctor: { id_doctor: doctor.id_doctor } },
      relations: { doctor: true },
    });

    if (citaAsociada) {
      throw new ConflictException('El doctor tiene citas asociadas');
    }

    return await this.doctorRepo.softDelete(doctor.id_doctor);
  }
}
