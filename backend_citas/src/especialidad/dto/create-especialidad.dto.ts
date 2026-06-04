import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateEspecialidadDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
    
    @IsString()
    @IsOptional()
    descripcion: string;
}
