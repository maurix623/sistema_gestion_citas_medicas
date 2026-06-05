import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSignoVitalDto } from './dto/create-signo_vital.dto';
import { UpdateSignoVitalDto } from './dto/update-signo_vital.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SignoVital } from './entities/signo_vital.entity';
import { Repository } from 'typeorm';
import { Cita } from 'src/cita/entities/cita.entity';
import { EstadoCita } from 'src/cita/enums/estado-cita.enums';

@Injectable()
export class SignoVitalService {
  constructor(
    @InjectRepository(SignoVital)
    private readonly signoVitalRepo: Repository<SignoVital>,

    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
  ) {}

  async create(createSignoVitalDto: CreateSignoVitalDto) {
    const cita = await this.citaRepo.findOne({
      where: { id_cita: createSignoVitalDto.id_cita },
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');

    if (cita.estado !== EstadoCita.ATENDIDA) {
      throw new ConflictException(
        'La cita debe estar ATENDIDA para registrar signos vitales',
      );
    }

    const signoExistente = await this.signoVitalRepo.findOne({
      where: { cita: { id_cita: createSignoVitalDto.id_cita } },
    });
    if (signoExistente)
      throw new ConflictException(
        'La cita ya tiene signos vitales registrados',
      );

    const signoVital = this.signoVitalRepo.create({
      ...createSignoVitalDto,
      cita,
    });

    return await this.signoVitalRepo.save(signoVital);
  }

  async findAll() {
    return await this.signoVitalRepo.find({
      relations: { cita: true },
    });
  }

  async findOne(id: number) {
    const signoVital = await this.signoVitalRepo.findOne({
      where: { id_signo: id },
      relations: { cita: true },
    });

    if (!signoVital) {
      throw new NotFoundException('Signos vitales no encontrados');
    }

    return signoVital;
  }

  async update(id: number, updateSignoVitalDto: UpdateSignoVitalDto) {
    const signoVital = await this.findOne(id);
    Object.assign(signoVital, updateSignoVitalDto);
    return await this.signoVitalRepo.save(signoVital);
  }

}
