import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Rol {
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Column({unique: true})
    nombre_rol: String;

    @OneToMany(()=> Usuario, (usuario)=>usuario.rol)
    usuario: Usuario[];
}
