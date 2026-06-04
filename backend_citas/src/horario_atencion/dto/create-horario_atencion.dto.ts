import {IsEnum,IsInt,IsNotEmpty,IsPositive,Matches, Max, Min} from 'class-validator';

import { DiaSemana } from '../enums/dia_semana.enum';

export class CreateHorarioAtencionDto {
    @IsInt()
    id_doctor: number;

    @IsEnum(DiaSemana)
    dia_semana: DiaSemana;

    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'hora_inicio debe tener formato HH:mm',
    })
    hora_inicio: string;

    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'hora_fin debe tener formato HH:mm',
    })
    hora_fin: string;

    @IsInt()
    @IsPositive()
    @Min(10)
    @Max(120)
    duracion_cita_minutos: number;
}   
