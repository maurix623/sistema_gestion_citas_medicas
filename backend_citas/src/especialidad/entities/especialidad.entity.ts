import { Doctor } from 'src/doctor/entities/doctor.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Especialidad {
  @PrimaryGeneratedColumn()
  id_especialidad: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

@CreateDateColumn()
creadoEn: Date;

@UpdateDateColumn()
actualizadoEn: Date;

@DeleteDateColumn()
eliminadoEn: Date;

  @OneToMany(() => Doctor, (doctor) => doctor.especialidad)
  doctores: Doctor[];
}
