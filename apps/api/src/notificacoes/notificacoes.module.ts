import { Module } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { WhatsApp, WhatsAppFake } from './whatsapp';

@Module({ providers: [NotificacoesService, { provide: WhatsApp, useClass: WhatsAppFake }] })
export class NotificacoesModule {}
