import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Especialidad } from "src/especialidad/entities/especialidad.entity";

@Entity()
export class Doctor {
    @PrimaryGeneratedColumn()
    id_doctor: number;

    @Column({length: 50, unique: true})
    matricula: string;

    @Column({length: 100, nullable: true})
    descripcion: string;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

    @OneToOne(()=>Usuario, (usuario) => usuario.doctor)
    @JoinColumn({name: 'id_usuario',})
    usuario: Usuario;

    @ManyToOne(()=>Especialidad, (especialidad) => especialidad.doctores)
    @JoinColumn({name: 'id_especialidad',})
    especialidad: Especialidad;
}
