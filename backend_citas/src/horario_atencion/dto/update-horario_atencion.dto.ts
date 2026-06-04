import { PartialType } from '@nestjs/mapped-types';
import { CreateHorarioAtencionDto } from './create-horario_atencion.dto';

export class UpdateHorarioAtencionDto extends PartialType(CreateHorarioAtencionDto) {}
