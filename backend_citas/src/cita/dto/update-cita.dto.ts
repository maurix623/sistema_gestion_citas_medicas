import { PartialType } from '@nestjs/mapped-types';
import { CreateCitaDto } from './create-cita.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCita } from '../enums/estado-cita.enums';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
    @IsOptional()
    @IsEnum(EstadoCita)
    estado?: EstadoCita;
}