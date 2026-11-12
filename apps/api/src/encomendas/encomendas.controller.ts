import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CriarEncomendaDto } from './dto/criar-encomenda.dto';
import { RetirarEncomendaDto } from './dto/retirar-encomenda.dto';
import { EncomendasService } from './encomendas.service';

@Controller('encomendas')
export class EncomendasController {
  constructor(private readonly encomendasService: EncomendasService) {}

  @Get('pendentes')
  listarPendentes() {
    return this.encomendasService.listarPendentes();
  }

  @Get('destinatarios')
  listarDestinatarios() {
    return this.encomendasService.listarDestinatarios();
  }

  @Post()
  criar(@Body() dto: CriarEncomendaDto) {
    return this.encomendasService.criar(dto);
  }

  @Post(':id/retirada')
  @HttpCode(200)
  retirar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RetirarEncomendaDto) {
    return this.encomendasService.retirar(id, dto);
  }
}
