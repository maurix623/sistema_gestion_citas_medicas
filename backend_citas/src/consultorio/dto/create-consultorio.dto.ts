import {IsNotEmpty,IsOptional,IsString,MaxLength,} from 'class-validator';

export class CreateConsultorioDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(150)
    ubicacion?: string;

    @IsString()
    @IsOptional()
    @MaxLength(200)
    descripcion?: string;
}