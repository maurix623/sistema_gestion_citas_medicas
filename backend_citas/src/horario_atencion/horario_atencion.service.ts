import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHorarioAtencionDto } from './dto/create-horario_atencion.dto';
import { UpdateHorarioAtencionDto } from './dto/update-horario_atencion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorarioAtencion } from './entities/horario_atencion.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

const HORA_APERTURA = '08:00';
const HORA_CIERRE = '20:00';

@Injectable()
export class HorarioAtencionService {
  constructor(
    @InjectRepository(HorarioAtencion)
    private readonly horarioRepo: Repository<HorarioAtencion>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}
  async create(createHorarioAtencionDto: CreateHorarioAtencionDto) {
    const doctor = await this.doctorRepo.findOne({
      where: {
        id_doctor: createHorarioAtencionDto.id_doctor,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    if (
      createHorarioAtencionDto.hora_inicio >= createHorarioAtencionDto.hora_fin
    ) {
      throw new ConflictException(
        'La hora de inicio debe ser menor que la hora final',
      );
    }

    if (
      createHorarioAtencionDto.hora_inicio < HORA_APERTURA ||
      createHorarioAtencionDto.hora_fin > HORA_CIERRE
    ) {
      throw new ConflictException(
        `Los horarios deben estar entre ${HORA_APERTURA} y ${HORA_CIERRE}`,
      );
    }

    const horarioExistente = await this.horarioRepo.findOne({
      where: {
        doctor: {
          id_doctor: createHorarioAtencionDto.id_doctor,
        },
        dia_semana: createHorarioAtencionDto.dia_semana,
        hora_inicio: createHorarioAtencionDto.hora_inicio,
        hora_fin: createHorarioAtencionDto.hora_fin,
      },
    });

    if (horarioExistente) {
      throw new ConflictException(
        'Este horario ya está registrado para el doctor',
      );
    }

    const horariosDelDia = await this.horarioRepo.find({
      where: {
        doctor: {
          id_doctor: createHorarioAtencionDto.id_doctor,
        },
        dia_semana: createHorarioAtencionDto.dia_semana,
      },
    });

    for (const horario of horariosDelDia) {
      const haySuperposicion =
        createHorarioAtencionDto.hora_inicio < horario.hora_fin &&
        createHorarioAtencionDto.hora_fin > horario.hora_inicio;

      if (haySuperposicion) {
        throw new ConflictException(
          'El horario se superpone con otro horario existente',
        );
      }
    }

    const horario = this.horarioRepo.create({
      ...createHorarioAtencionDto,
      doctor,
    });

    return await this.horarioRepo.save(horario);
  }

  async findAll() {
    return await this.horarioRepo.find({
      relations: { doctor: true },
    });
  }

  async findOne(id: number) {
    const horario = await this.horarioRepo.findOne({
      where: { id_horario: id },
      relations: { doctor: true },
    });
    if (!horario)
      throw new NotFoundException('Horario de atencion no encontrado');
    return horario;
  }

  async update(id: number, updateHorarioAtencionDto: UpdateHorarioAtencionDto) {
    const horario = await this.findOne(id);

    const horaInicio =
      updateHorarioAtencionDto.hora_inicio ?? horario.hora_inicio;
    const horaFin = updateHorarioAtencionDto.hora_fin ?? horario.hora_fin;
    const diaSemana = updateHorarioAtencionDto.dia_semana ?? horario.dia_semana;

    if (horaInicio >= horaFin) {
      throw new ConflictException(
        'La hora de inicio debe ser menor que la hora final',
      );
    }

    if (horaInicio < HORA_APERTURA || horaFin > HORA_CIERRE) {
      throw new ConflictException(
        `Los horarios deben estar entre ${HORA_APERTURA} y ${HORA_CIERRE}`,
      );
    }

    const horarioExistente = await this.horarioRepo.findOne({
      where: {
        doctor: {
          id_doctor: horario.doctor.id_doctor,
        },
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      },
    });

    if (horarioExistente && horarioExistente.id_horario !== horario.id_horario) {
      throw new ConflictException('Este horario ya está registrado para el doctor');}

    const horariosDelDia = await this.horarioRepo.find({
      where: {
        doctor: {
          id_doctor: horario.doctor.id_doctor,
        },
        dia_semana: diaSemana,
      },
    });

    for (const horarioExistente of horariosDelDia) {
      if (horarioExistente.id_horario === horario.id_horario) {
        continue;
      }

      const haySuperposicion =
        horaInicio < horarioExistente.hora_fin &&
        horaFin > horarioExistente.hora_inicio;

      if (haySuperposicion) {
        throw new ConflictException(
          'El horario se superpone con otro horario existente',
        );
      }
    }

    Object.assign(horario, updateHorarioAtencionDto);

    return await this.horarioRepo.save(horario);
  }

  async remove(id: number) {
    const horario = await this.findOne(id);
    return await this.horarioRepo.softDelete(horario.id_horario);
  }
}
