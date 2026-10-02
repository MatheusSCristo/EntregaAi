import { Body, Controller, Get, Post } from '@nestjs/common';
import { CriarEncomendaDto } from './dto/criar-encomenda.dto';
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
}
