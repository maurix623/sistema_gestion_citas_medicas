import { Usuario } from 'src/usuario/entities/usuario.entity';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Paciente {
  @PrimaryGeneratedColumn()
  id_paciente: number;

  @Column({
    length: 5,
    nullable: true,
  })
  tipo_sangre: string;

  @Column({
    length: 100,
    nullable: true,
  })
  alergias: string;

  @Column({
    nullable: true,
  })
  fecha_nacimiento: Date;

  @Column({
    length: 5,
    nullable: true,
  })
  sexo: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;

  @OneToOne(() => Usuario, (usuario) => usuario.paciente)
  @JoinColumn({name: 'id_usuario',})
  usuario: Usuario;
}
