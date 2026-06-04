import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HorarioAtencionService } from './horario_atencion.service';
import { CreateHorarioAtencionDto } from './dto/create-horario_atencion.dto';
import { UpdateHorarioAtencionDto } from './dto/update-horario_atencion.dto';

@Controller('horario_atencion')
export class HorarioAtencionController {
  constructor(private readonly horarioAtencionService: HorarioAtencionService) {}

  @Post()
  create(@Body() createHorarioAtencionDto: CreateHorarioAtencionDto) {
    return this.horarioAtencionService.create(createHorarioAtencionDto);
  }

  @Get()
  findAll() {
    return this.horarioAtencionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.horarioAtencionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHorarioAtencionDto: UpdateHorarioAtencionDto) {
    return this.horarioAtencionService.update(+id, updateHorarioAtencionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.horarioAtencionService.remove(+id);
  }
}
