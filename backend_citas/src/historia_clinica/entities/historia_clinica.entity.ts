import { Cita } from 'src/cita/entities/cita.entity';
import {Column,CreateDateColumn,Entity,JoinColumn,OneToOne,PrimaryGeneratedColumn,UpdateDateColumn,} from 'typeorm';

@Entity()
export class HistoriaClinica {
    @PrimaryGeneratedColumn()
    id_historia: number;

    @Column({length: 200})
    diagnostico: string;

    @Column({length: 200,nullable: true,})
    tratamiento: string;

    @Column({length: 200,nullable: true,})
    notas_medicas: string;

    @CreateDateColumn()
    creadoEn: Date;

    @UpdateDateColumn()
    actualizadoEn: Date;

    @OneToOne(() => Cita,(cita) => cita.historiaClinica)
    @JoinColumn({name: 'id_cita'})
    cita: Cita;
}