import {IsInt,IsOptional,IsNumber,IsString,MaxLength,Min,} from 'class-validator';

export class CreateSignoVitalDto {

    @IsInt()
    @Min(1)
    id_cita: number;

    @IsOptional()
    @IsNumber()
    peso?: number;

    @IsOptional()
    @IsNumber()
    altura?: number;

    @IsOptional()
    @IsNumber()
    temperatura?: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    presion_arterial?: string;

    @IsOptional()
    @IsInt()
    frecuencia_cardiaca?: number;

    @IsOptional()
    @IsNumber()
    saturacion_oxigeno?: number;
}