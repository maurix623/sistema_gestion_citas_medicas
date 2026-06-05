import { Exclude } from 'class-transformer';
import { Rol } from 'src/rol/entities/rol.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Paciente } from 'src/paciente/entities/paciente.entity';
import { LogAcceso } from 'src/logs_acceso/entities/logs_acceso.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  correo: string;

  @Exclude()
  @Column({ length: 255 })
  password: string;

  @Column()
  telefono: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @OneToOne(() => Doctor, (doctor) => doctor.usuario)
  doctor: Doctor;

  @OneToOne(() => Paciente, (paciente) => paciente.usuario)
  paciente: Paciente;

  @OneToMany(() => LogAcceso, (log) => log.usuario)
  logsAcceso: LogAcceso[];
}
