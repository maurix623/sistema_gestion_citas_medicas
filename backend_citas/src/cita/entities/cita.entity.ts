import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { EstadoCita } from "../enums/estado-cita.enums";
import { Paciente } from "src/paciente/entities/paciente.entity";
import { Doctor } from "src/doctor/entities/doctor.entity";
import { SignoVital } from "src/signo_vital/entities/signo_vital.entity";
import { HistoriaClinica } from "src/historia_clinica/entities/historia_clinica.entity";

@Entity()
export class Cita {
    @PrimaryGeneratedColumn()
    id_cita: number;

    @Column({type: 'date'})
    fecha: string;

    @Column({type: 'time'})
    hora: string;

    @Column({type: 'enum', enum: EstadoCita, default: EstadoCita.PROGRAMADA})
    estado: EstadoCita;

    @Column({length: 200, nullable: true})
    observaciones: string;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

    @ManyToOne(()=>Paciente, (paciente)=>paciente.citas)
    @JoinColumn({ name: 'id_paciente' })
    paciente: Paciente;

    @ManyToOne(()=>Doctor, (doctor)=>doctor.citas)
    @JoinColumn({ name: 'id_doctor' })
    doctor: Doctor;

    @OneToOne(()=>SignoVital, (signoVital)=>signoVital.cita)
    signoVital: SignoVital

    @OneToOne(()=>HistoriaClinica, (historiaClinica)=>historiaClinica.cita)
    historiaClinica: HistoriaClinica
}
