import { PartialType } from '@nestjs/mapped-types';
import { CreateConsultorioDto } from './create-consultorio.dto';

export class UpdateConsultorioDto extends PartialType(CreateConsultorioDto) {}
