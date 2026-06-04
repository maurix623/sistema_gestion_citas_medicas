import { Doctor } from "src/doctor/entities/doctor.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn} from "typeorm";
import { DiaSemana } from "../enums/dia_semana.enum";

@Entity()
export class HorarioAtencion {
    @PrimaryGeneratedColumn()
    id_horario: number;

    @Column({type: 'enum', enum: DiaSemana})
    dia_semana: DiaSemana;

    @Column({type: 'time'})
    hora_inicio: string; 

    @Column({type: 'time'})
    hora_fin: string;

    @Column()
    duracion_cita_minutos: number;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

    @ManyToOne(()=> Doctor, (doctor)=>doctor.horarios)
    @JoinColumn({ name: 'id_doctor' })
    doctor: Doctor
}
