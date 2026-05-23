import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength, minLength } from "class-validator";


export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    telefono: string;

    @IsNumber()
    id_rol: number;
}
