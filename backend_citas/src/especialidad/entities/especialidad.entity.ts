import { Column, Entity, PrimaryGeneratedColumn, DeleteDateColumn } from "typeorm";


@Entity()
export class Especialidad {
    @PrimaryGeneratedColumn()
    id_especialidad: number;

    @Column({length: 100, unique: true})
    nombre: string;

    @Column({length: 255, nullable: true})
    descripcion: string;

    @DeleteDateColumn()
    eliminadoEn: Date;
}
