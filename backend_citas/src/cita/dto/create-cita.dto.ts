import {IsDateString,IsInt,IsNotEmpty,IsOptional,IsString,Matches,MaxLength,Min,} from 'class-validator';

export class CreateCitaDto {
    @IsInt()
    @Min(1)
    id_paciente: number;

    @IsInt()
    @Min(1)
    id_doctor: number;

    @IsDateString()
    fecha: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'La hora debe tener formato HH:mm',
    })
    hora: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    observaciones?: string;
}