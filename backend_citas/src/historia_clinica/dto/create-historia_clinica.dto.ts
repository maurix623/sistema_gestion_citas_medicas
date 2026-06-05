import {IsInt,IsNotEmpty,IsOptional,IsString,MaxLength,Min,} from 'class-validator';

export class CreateHistoriaClinicaDto {
    @IsInt()
    @Min(1)
    id_cita: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    diagnostico: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    tratamiento?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    notas_medicas?: string;
}