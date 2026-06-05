import { Module } from '@nestjs/common';
import { SignoVitalService } from './signo_vital.service';
import { SignoVitalController } from './signo_vital.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignoVital } from './entities/signo_vital.entity';
import { Cita } from 'src/cita/entities/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SignoVital, Cita])],
  controllers: [SignoVitalController],
  providers: [SignoVitalService],
})
export class SignoVitalModule {}
