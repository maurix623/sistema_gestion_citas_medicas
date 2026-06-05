import { Controller, Get, Param } from '@nestjs/common';
import { LogsAccesoService } from './logs_acceso.service';

@Controller('logs_acceso')
export class LogsAccesoController {
  constructor(private readonly logsAccesoService: LogsAccesoService) {}

  @Get()
  findAll() {
    return this.logsAccesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsAccesoService.findOne(+id);
  }
}
