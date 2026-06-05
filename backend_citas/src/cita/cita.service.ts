import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Paciente } from 'src/paciente/entities/paciente.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { HorarioAtencion } from 'src/horario_atencion/entities/horario_atencion.entity';
import { Repository } from 'typeorm';
import { DiaSemana } from 'src/horario_atencion/enums/dia_semana.enum';

@Injectable()
export class CitaService {
  constructor(
    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,

    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(HorarioAtencion)
    private readonly horarioRepo: Repository<HorarioAtencion>,
  ) {}

  private obtenerDiaSemana(fecha: Date): DiaSemana {
    const dias = [
      DiaSemana.DOMINGO,
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO,
    ];

    return dias[fecha.getDay()];
  }

  private generarSlots(
    horaInicio: string,
    horaFin: string,
    duracion: number,
  ): string[] {
    const slots: string[] = [];

    const inicio = new Date(`2000-01-01T${horaInicio}`);

    const fin = new Date(`2000-01-01T${horaFin}`);

    const actual = new Date(inicio);

    while (actual < fin) {
      slots.push(actual.toTimeString().slice(0, 5));

      actual.setMinutes(actual.getMinutes() + duracion);
    }

    return slots;
  }

  private convertirFechaLocal(fecha: string): Date {
    const [year, month, day] = fecha.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private normalizarHora(hora: string): string {
    return hora.substring(0, 5);
  }

  async create(createCitaDto: CreateCitaDto) {
    const paciente = await this.pacienteRepo.findOne({
      where: {
        id_paciente: createCitaDto.id_paciente,
      },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const doctor = await this.doctorRepo.findOne({
      where: {
        id_doctor: createCitaDto.id_doctor,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    const fechaCita = this.convertirFechaLocal(createCitaDto.fecha);

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (fechaCita < hoy) {
      throw new ConflictException(
        'No se pueden registrar citas en fechas pasadas',
      );
    }

    const diaSemana = this.obtenerDiaSemana(fechaCita);

    const horario = await this.horarioRepo.findOne({
      where: {
        doctor: {
          id_doctor: doctor.id_doctor,
        },
        dia_semana: diaSemana,
      },
    });

    if (!horario) {
      throw new ConflictException('El doctor no atiende ese día');
    }

    const hora = this.normalizarHora(createCitaDto.hora);

    const horaInicio = this.normalizarHora(horario.hora_inicio);

    const horaFin = this.normalizarHora(horario.hora_fin);
    if (hora < horaInicio || hora >= horaFin) {
      throw new ConflictException('La hora está fuera del horario de atención');
    }

    const slotsValidos = this.generarSlots(
      horario.hora_inicio,
      horario.hora_fin,
      horario.duracion_cita_minutos,
    );

    if (!slotsValidos.includes(createCitaDto.hora)) {
      throw new ConflictException(
        'La hora seleccionada no corresponde a un horario válido de atención',
      );
    }

    const citaExistente = await this.citaRepo.findOne({
      where: {
        doctor: {
          id_doctor: doctor.id_doctor,
        },
        fecha: createCitaDto.fecha,
        hora: createCitaDto.hora,
      },
    });

    if (citaExistente) {
      throw new ConflictException('Ese horario ya está reservado');
    }

    const cita = this.citaRepo.create({
      fecha: createCitaDto.fecha,
      hora: createCitaDto.hora,
      observaciones: createCitaDto.observaciones,
      paciente,
      doctor,
    });

    return await this.citaRepo.save(cita);
  }

  async findAll() {
    return await this.citaRepo.find({
      relations: {
        paciente: { usuario: true },
        doctor: { usuario: true, especialidad: true, consultorio: true },
      },
    });
  }

  async findOne(id: number) {
    const cita = await this.citaRepo.findOne({
      where: { id_cita: id },
      relations: {
        paciente: { usuario: true },
        doctor: { usuario: true, especialidad: true, consultorio: true },
      },
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    return cita;
  }

  async update(id: number, updateCitaDto: UpdateCitaDto) {
    const cita = await this.findOne(id);

    const fecha = updateCitaDto.fecha ?? cita.fecha;

    const hora = updateCitaDto.hora ?? cita.hora;

    const fechaCita = this.convertirFechaLocal(fecha);

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (fechaCita < hoy) {
      throw new ConflictException(
        'No se pueden registrar citas en fechas pasadas',
      );
    }

    const diaSemana = this.obtenerDiaSemana(fechaCita);

    const horario = await this.horarioRepo.findOne({
      where: {
        doctor: {
          id_doctor: cita.doctor.id_doctor,
        },
        dia_semana: diaSemana,
      },
    });

    if (!horario) {
      throw new ConflictException('El doctor no atiende ese día');
    }

    const horaNormalizada = this.normalizarHora(hora);

    const horaInicio = this.normalizarHora(horario.hora_inicio);

    const horaFin = this.normalizarHora(horario.hora_fin);

    if (horaNormalizada < horaInicio || horaNormalizada >= horaFin) {
      throw new ConflictException('La hora está fuera del horario de atención');
    }

    const slotsValidos = this.generarSlots(
      horaInicio,
      horaFin,
      horario.duracion_cita_minutos,
    );

    if (!slotsValidos.includes(horaNormalizada)) {
      throw new ConflictException(
        'La hora seleccionada no corresponde a un horario válido de atención',
      );
    }

    const citaExistente = await this.citaRepo.findOne({
      where: {
        doctor: {
          id_doctor: cita.doctor.id_doctor,
        },
        fecha,
        hora: horaNormalizada,
      },
    });

    if (citaExistente && citaExistente.id_cita !== cita.id_cita) {
      throw new ConflictException('Ese horario ya está reservado');
    }

    Object.assign(cita, updateCitaDto);

    return await this.citaRepo.save(cita);
  }

  async remove(id: number) {
    const cita = await this.findOne(id);

    return await this.citaRepo.softDelete(cita.id_cita);
  }
}
