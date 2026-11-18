import {
  Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CriarEncomendaDto } from './dto/criar-encomenda.dto';
import { RetirarEncomendaDto } from './dto/retirar-encomenda.dto';
import { EncomendasService } from './encomendas.service';
import { EtiquetasService, LIMITE_FOTO_ETIQUETA } from './etiquetas.service';

@Controller('encomendas')
export class EncomendasController {
  constructor(
    private readonly encomendasService: EncomendasService,
    private readonly etiquetasService: EtiquetasService,
  ) {}

  @Post('leitura-etiqueta')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('foto', {
    limits: { fileSize: LIMITE_FOTO_ETIQUETA + 1, files: 1, fields: 0 },
  }))
  lerEtiqueta(@UploadedFile() foto?: { buffer: Buffer }) {
    return this.etiquetasService.ler(foto?.buffer);
  }

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
