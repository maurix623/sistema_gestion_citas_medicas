import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateHistoriaClinicaDto } from './create-historia_clinica.dto';

export class UpdateHistoriaClinicaDto extends PartialType(
    OmitType(CreateHistoriaClinicaDto, ['id_cita'] as const)) {}