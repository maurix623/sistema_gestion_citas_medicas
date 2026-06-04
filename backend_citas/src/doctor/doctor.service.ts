import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Especialidad } from 'src/especialidad/entities/especialidad.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Especialidad)
    private readonly especialidadRepo: Repository<Especialidad>,
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
    });

    return await this.doctorRepo.save(doctor);
  }

  async findAll() {
      return await this.doctorRepo.find({
        relations: {
          usuario: true,
          especialidad: true,
        },
      })
  }

  async findOne(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: {id_doctor: id},
      relations: {
        usuario: true,
        especialidad: true
      }
    }); 
    if(!doctor) throw new NotFoundException('Doctor no encontrado');

    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, updateDoctorDto);
    return await this.doctorRepo.save(doctor);
  }

  async remove(id: number) {
    const doctor = await this.findOne(id);
    return await this.doctorRepo.softDelete(doctor.id_doctor);

  }
}
