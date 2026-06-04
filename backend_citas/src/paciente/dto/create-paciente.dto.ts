import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreatePacienteDto {
  @IsInt()
  id_usuario: number;

  @IsOptional()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  tipo_sangre?: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: Date;

  @IsOptional()
  @IsIn(['M', 'F'])
  sexo?: string;
}
