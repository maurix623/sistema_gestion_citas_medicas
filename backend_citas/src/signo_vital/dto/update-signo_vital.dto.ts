import { PartialType } from '@nestjs/mapped-types';
import { CreateSignoVitalDto } from './create-signo_vital.dto';

export class UpdateSignoVitalDto extends PartialType(CreateSignoVitalDto) {}
