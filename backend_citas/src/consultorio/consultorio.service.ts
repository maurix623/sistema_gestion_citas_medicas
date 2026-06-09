import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConsultorioDto } from './dto/create-consultorio.dto';
import { UpdateConsultorioDto } from './dto/update-consultorio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Consultorio } from './entities/consultorio.entity';
import { Repository } from 'typeorm';
import { Doctor } from 'src/doctor/entities/doctor.entity';

@Injectable()
export class ConsultorioService {
  constructor(
    @InjectRepository(Consultorio)
    private readonly consultorioRepo: Repository<Consultorio>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}
  async create(createConsultorioDto: CreateConsultorioDto) {
    const consultorioExiste = await this.consultorioRepo.findOne({
      where: { nombre: createConsultorioDto.nombre },
    });
    if (consultorioExiste)
      throw new ConflictException('Ya existe un consultorio con ese nombre');

    const consultorio = this.consultorioRepo.create(createConsultorioDto);
    return await this.consultorioRepo.save(consultorio);
  }

  async findAll() {
    return await this.consultorioRepo.find();
  }

  async findOne(id: number) {
    const consultorio = await this.consultorioRepo.findOne({
      where: { id_consultorio: id },
    });
    if (!consultorio) throw new NotFoundException('Consultorio no encontrado');
    return consultorio;
  }

  async update(id: number, updateConsultorioDto: UpdateConsultorioDto) {
    const consultorio = await this.findOne(id);

    if (updateConsultorioDto.nombre) {
      const consultorioExiste = await this.consultorioRepo.findOne({
        where: {nombre: updateConsultorioDto.nombre,},
      });

      if (consultorioExiste && consultorioExiste.id_consultorio !== consultorio.id_consultorio){
        throw new ConflictException('Ya existe un consultorio con ese nombre');
      }
    }
    Object.assign(consultorio, updateConsultorioDto);
    return await this.consultorioRepo.save(consultorio);
  }

  async remove(id: number) {
    const consultorio = await this.findOne(id);

    const doctorAsociado = await this.doctorRepo.findOne({
      where: { consultorio: { id_consultorio: consultorio.id_consultorio } },
      relations: { consultorio: true },
    });

    if (doctorAsociado) {
      throw new ConflictException('El consultorio tiene doctores asociados');
    }

    return await this.consultorioRepo.softDelete(consultorio.id_consultorio);
  }
}
