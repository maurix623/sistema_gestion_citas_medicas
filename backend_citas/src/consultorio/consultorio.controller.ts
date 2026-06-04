import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsultorioService } from './consultorio.service';
import { CreateConsultorioDto } from './dto/create-consultorio.dto';
import { UpdateConsultorioDto } from './dto/update-consultorio.dto';

@Controller('consultorio')
export class ConsultorioController {
  constructor(private readonly consultorioService: ConsultorioService) {}

  @Post()
  create(@Body() createConsultorioDto: CreateConsultorioDto) {
    return this.consultorioService.create(createConsultorioDto);
  }

  @Get()
  findAll() {
    return this.consultorioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultorioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsultorioDto: UpdateConsultorioDto) {
    return this.consultorioService.update(+id, updateConsultorioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultorioService.remove(+id);
  }
}
