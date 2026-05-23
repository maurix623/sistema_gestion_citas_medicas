import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Rol {
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Column({unique: true})
    nombre_rol: String;
}
