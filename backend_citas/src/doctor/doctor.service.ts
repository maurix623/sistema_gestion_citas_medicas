import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Especialidad } from 'src/especialidad/entities/especialidad.entity';
import { Consultorio } from 'src/consultorio/entities/consultorio.entity';

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
  ) {}
  async create(createDoctorDto: CreateDoctorDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: createDoctorDto.id_usuario },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const especialidad = await this.especialidadRepo.findOne({
      where: { id_especialidad: createDoctorDto.id_especialidad },
    });
    if (!especialidad)
      throw new NotFoundException('Especialidad no encontrada');

    const consultorio = await this.consultorioRepo.findOne({
      where: {
        id_consultorio: createDoctorDto.id_consultorio,
      },
    });

    if (!consultorio) {
      throw new NotFoundException('Consultorio no encontrado');
    }

    const doctorExiste = await this.doctorRepo.findOne({
      where: { usuario: { id_usuario: createDoctorDto.id_usuario } },
    });
    if (doctorExiste)
      throw new ConflictException(
        'Este usuario ya esta registrado como doctor',
      );

    const doctor = this.doctorRepo.create({
      ...createDoctorDto,
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
      where: { id_doctor: id },
      relations: {
        usuario: true,
        especialidad: true,
        consultorio: true,
      },
    });
    if (!doctor) throw new NotFoundException('Doctor no encontrado');

    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    if (updateDoctorDto.matricula) {
      const doctorExistente = await this.doctorRepo.findOne({
        where: {
          matricula: updateDoctorDto.matricula,
        },
      });

      if (doctorExistente && doctorExistente.id_doctor !== doctor.id_doctor) {
        throw new ConflictException('Ya existe un doctor con esa matrícula');
      }
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

    Object.assign(doctor, {
      matricula: updateDoctorDto.matricula ?? doctor.matricula,
      descripcion: updateDoctorDto.descripcion ?? doctor.descripcion,
    });

    return await this.doctorRepo.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);
    return await this.doctorRepo.softDelete(doctor.id_doctor);
  }
}
