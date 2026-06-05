import { Cita } from "src/cita/entities/cita.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class SignoVital {
    @PrimaryGeneratedColumn()
    id_signo: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    peso: number;

    @Column({type: 'decimal',precision: 4,scale: 2,nullable: true,})
    altura: number;

    @Column({type: 'decimal',precision: 4,scale: 2,nullable: true,})
    temperatura: number;

    @Column({length: 20,nullable: true,})
    presion_arterial: string;

    @Column({type: 'int',nullable: true,})
    frecuencia_cardiaca: number;

    @Column({type: 'decimal',precision: 5,scale: 2,nullable: true,})
    saturacion_oxigeno: number;

    @CreateDateColumn()
    creadoEn: Date;
    
    @UpdateDateColumn()
    actualizadoEn: Date;

    @OneToOne(() => Cita, (cita) => cita.signoVital)
    @JoinColumn({name: 'id_cita'})
    cita: Cita;
}
