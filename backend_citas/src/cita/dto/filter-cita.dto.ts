import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoCita } from '../enums/estado-cita.enums';

export class FilterCitaDto {
    @IsOptional()
    @IsString()
    fecha?: string;

    @IsOptional()
    @IsEnum(EstadoCita)
    estado?: EstadoCita;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    doctor?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    paciente?: number;
}
