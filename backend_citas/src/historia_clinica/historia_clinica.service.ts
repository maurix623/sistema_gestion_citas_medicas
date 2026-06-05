import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHistoriaClinicaDto } from './dto/create-historia_clinica.dto';
import { UpdateHistoriaClinicaDto } from './dto/update-historia_clinica.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoriaClinica } from './entities/historia_clinica.entity';
import { Repository } from 'typeorm';
import { Cita } from 'src/cita/entities/cita.entity';
import { SignoVital } from 'src/signo_vital/entities/signo_vital.entity';
import { EstadoCita } from 'src/cita/enums/estado-cita.enums';

@Injectable()
export class HistoriaClinicaService {
  constructor(
    @InjectRepository(HistoriaClinica)
    private readonly historiaRepo: Repository<HistoriaClinica>,

    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,

    @InjectRepository(SignoVital)
    private readonly signoVitalRepo: Repository<SignoVital>,
  ) {}

  async create(createHistoriaClinicaDto: CreateHistoriaClinicaDto) {
    const cita = await this.citaRepo.findOne({
      where: { id_cita: createHistoriaClinicaDto.id_cita },
    });
    if (!cita) throw new NotFoundException('Cita no  encontrada');

    if (cita.estado !== EstadoCita.ATENDIDA)
      throw new ConflictException(
        'la cita debe estar ATENDIDA para registrar una historia clinica',
      );

    const signos = await this.signoVitalRepo.findOne({
      where: { cita: { id_cita: createHistoriaClinicaDto.id_cita } },
    });
    if (!signos)
      throw new ConflictException(
        'Debe registrar signos vitales antes de crear la historia clinica',
      );

    const historiaExistente = await this.historiaRepo.findOne({
      where: { cita: { id_cita: createHistoriaClinicaDto.id_cita } },
    });
    if (historiaExistente)
      throw new ConflictException(
        'La cita ya tiene  historia clinica registrada',
      );

    const historia = this.historiaRepo.create({
      ...createHistoriaClinicaDto,
      cita,
    });
    return await this.historiaRepo.save(historia);
  }

  async findAll() {
    return await this.historiaRepo.find({
      relations: {
        cita: {
          paciente: {
            usuario: true,
          },
          doctor: {
            usuario: true,
            especialidad: true,
            consultorio: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const historia = await this.historiaRepo.findOne({
      where: { id_historia: id },
      relations: {
        cita: {
          paciente: {
            usuario: true,
          },
          doctor: {
            usuario: true,
            especialidad: true,
            consultorio: true,
          },
        },
      },
    });

    if (!historia) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    return historia;
  }

  async update(id: number, updateHistoriaClinicaDto: UpdateHistoriaClinicaDto) {
    const historia = await this.findOne(id);
    Object.assign(historia, updateHistoriaClinicaDto);
    return await this.historiaRepo.save(historia);
  }

}
