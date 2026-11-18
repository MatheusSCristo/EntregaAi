import { Module } from '@nestjs/common';
import { EncomendasController } from './encomendas.controller';
import { EncomendasService } from './encomendas.service';
import { EtiquetasService } from './etiquetas.service';
import { LeitorEtiqueta, LeitorEtiquetaOpenAI } from './leitor-etiqueta';

@Module({
  controllers: [EncomendasController],
  providers: [
    EncomendasService,
    EtiquetasService,
    { provide: LeitorEtiqueta, useClass: LeitorEtiquetaOpenAI },
  ],
})
export class EncomendasModule {}
