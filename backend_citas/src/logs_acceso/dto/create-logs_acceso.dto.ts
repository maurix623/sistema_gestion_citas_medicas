import {IsEnum,IsInt,IsNotEmpty,IsString,Min} from 'class-validator';

import { EventoAcceso } from '../enums/evento-acceso.enum';

export class CreateLogsAccesoDto {
    @IsInt()
    @Min(1)
    id_usuario: number;
    
    @IsString()
    @IsNotEmpty()
    ip: string;
    
    @IsString()
    @IsNotEmpty()
    browser: string;
    
    @IsEnum(EventoAcceso)
    evento: EventoAcceso;
}