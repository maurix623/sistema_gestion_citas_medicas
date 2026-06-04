import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDoctorDto {

  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @IsInt()
  @IsNotEmpty()
  id_especialidad: number;

  @IsInt()
  @IsNotEmpty()
  id_consultorio: number;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsString()
  @IsOptional()
  descripcion: string;
}