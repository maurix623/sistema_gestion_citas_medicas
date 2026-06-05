import { Usuario } from 'src/usuario/entities/usuario.entity';
import { EventoAcceso } from '../enums/evento-acceso.enum';

import {Column,CreateDateColumn,Entity,JoinColumn,ManyToOne,PrimaryGeneratedColumn,} from 'typeorm';

@Entity()
export class LogAcceso {
    @PrimaryGeneratedColumn()
    id_log: number;

    @Column({ length: 50 })
    ip: string;

    @Column({ length: 200 })
    browser: string;

    @Column({type: 'enum',enum: EventoAcceso})
    evento: EventoAcceso;

    @CreateDateColumn()
    fecha_hora: Date;

    @ManyToOne(() => Usuario,(usuario) => usuario.logsAcceso)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;
}