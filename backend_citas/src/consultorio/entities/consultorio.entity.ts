import { Doctor } from "src/doctor/entities/doctor.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany} from "typeorm";

@Entity()
export class Consultorio {
    @PrimaryGeneratedColumn()
    id_consultorio: number;

    @Column({length: 100, unique: true})
    nombre: string;

    @Column({length: 150, nullable: true})
    ubicacion: string;

    @Column({length: 200, nullable: true})
    descripcion: string;

    @CreateDateColumn()
    creadoEn: Date;
    
    @UpdateDateColumn()
    actualizadoEn: Date;
    
    @DeleteDateColumn()
    eliminadoEn: Date;

    @OneToMany(() => Doctor, (doctor) => doctor.consultorio)
    doctores: Doctor[];
}
